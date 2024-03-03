import { TextLineStream } from "https://deno.land/std/streams/mod.ts";
import { stringify } from "https://deno.land/std@0.207.0/yaml/mod.ts";

const YAMLOUTDIR = "3gpp-outputs_yaml";
const JSONOUTDIR = "3gpp-outputs_json";

const filename = Deno.args[0];
const file = await Deno.open(filename);

let STATUS_STARTED, STATUS_INDEX_END, STATUS_READING_VALUE = false;


const PARSER_MAPPINGS = {
  "3GPP TS 28.554 V18.4.0 (2023-12)": "28.554_i40_v1",
  "3GPP TS 28.552 V18.5.0 (2023-12)": "28.552_i50_v1",
};

const PARSER_SETTINGS = {

  "28.554_i40_v1": {
    ID: "28.554_i40_v1",
    STATUS_INDEX_END_REGEX: /^ Foreword/,
    STATUS_STARTED_REGEX: /^6 End to end KPI definitions/,
    STATUS_FINISHED_REGEX: /^########  Annex A/,
    MAX_SECTION_LEVELS: 3,
    MAIN_SECTION: 6,
    FIELD_NAMES: {
      "a": "Name",
      "b": "Description",
      "c": "Formula",
      "d": "KPI Object",
      "e": "Remark",
    },
    ADDITIONAL_COLUMNS: [],
  },


  "28.552_i50_v1": {
    ID: "28.552_i50_v1",
    STATUS_INDEX_END_REGEX: /^ Foreword/,
    STATUS_STARTED_REGEX: /^5 Performance measurements for 5G network functions/,
    STATUS_FINISHED_REGEX: /^########  Annex A/,
    MAX_SECTION_LEVELS: 6,
    MAIN_SECTION: "[5|6]",
    FIELD_NAMES: {
      "a": "a",
      "b": "b",
      "c": "c",
      "d": "d",
      "e": "e",
      "f": "f",
      "g": "g",
      "h": "h",
      "i": "i",
      "j": "j",
      "k": "k",
      "l": "l",
    },
    ADDITIONAL_COLUMNS: [
      {
        colname: "NF",
        colparser: function (record) {
          const nfstr = record["Section Title 0"];
          const nf = new RegExp(
            "(?:Common )?[P|p]erformance measurements for (.*)",
          ).exec(nfstr);
          return nf ? (nf[1] === "NFs" ? "(Common)" : nf[1]) : "";
        },
      },
    ],
  },
};



const lines = file.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());

let kpirecords: any = [];
let kpirecord = {};
let letter;
let fieldname;
let ts3gpp;
let parsersettings;

let maxsectionlevels;
let CURRSECTIONS;

// ######

const gettitlesection = function (sections) {
  for (let i = sections.length; i >= 0; i--) {
    if (sections[i]) {
      return sections[i];
    }
  }
};

const getsectionsstr = function (sections) {
  let retstr = sections[0].str;

  for (let i = 1; i < sections.length; i++) {
    retstr += sections[i] && sections[i].str != ""
      ? " >> " + sections[i].str
      : "";
  }

  return retstr;
};

for await (const line of lines) {

  if (!ts3gpp) {
    ts3gpp = line;
    parsersettings = PARSER_SETTINGS[PARSER_MAPPINGS[ts3gpp]];
    maxsectionlevels = parsersettings.MAX_SECTION_LEVELS;
  }

  if (line.match(parsersettings.STATUS_INDEX_END_REGEX)) {
    STATUS_INDEX_END = true;
  }

  if (STATUS_INDEX_END && line.match(parsersettings.STATUS_STARTED_REGEX)) {
    STATUS_STARTED = true;
  }

  if (STATUS_STARTED && line.match(parsersettings.STATUS_FINISHED_REGEX) ) {
    STATUS_STARTED = false
  }

  if (STATUS_STARTED) {
    
    /************************************************************************************************************************************************/

    for (let i = 0; i <= maxsectionlevels; i++) {
      let subsection;
      const hashcharcount = i + 2;

      const commonregexstr = `^\\s*${
        i === 0
          ? "(" + parsersettings.MAIN_SECTION + "(?:\\.?[0-9]*){1,1}"
          : "[#]{" + hashcharcount + "," + hashcharcount +
            "}\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}"
      }) (.*)`;

      const sectionregex = new RegExp(commonregexstr);

      if (subsection = sectionregex.exec(line)) {
        if (i === 0) {
          CURRSECTIONS = new Array(maxsectionlevels + 1);
        }

        CURRSECTIONS[i] = {
          str: `${subsection[2]} (${subsection[1]})`,
          section: subsection[1],
          sectiontitle: subsection[2],
        };
        STATUS_READING_VALUE = false;
        for (let k = i + 1; k <= maxsectionlevels + 2; k++) {
          CURRSECTIONS[k] = undefined;
        }
        console.error(getsectionsstr(CURRSECTIONS));
      }
    }

    /************************************************************************************************************************************************/



    if ( letter = /^\s*(?:> )?([a-z]).\)(.*)/.exec(line) ) {

      const fieldcode = letter[1];

      STATUS_READING_VALUE = true;
      fieldname = parsersettings.FIELD_NAMES[fieldcode];
      

      if (fieldcode === "b" && ! kpirecord[fieldname]) {

        // if the fieldcode is b and kpirecord is empty it means we are starting to read a new section/record
        // add the section titles and subtitles to the record

        kpirecord["Section"] = getsectionsstr(CURRSECTIONS);
        const titlesection = gettitlesection(CURRSECTIONS);
        kpirecord["Title"] = titlesection.sectiontitle;
        kpirecord["Section Nr"] = titlesection.section;

        for (let i = 0; i < CURRSECTIONS.length; i++) {
          kpirecord["Section Title " + i] = CURRSECTIONS[i]
            ? CURRSECTIONS[i].sectiontitle
            : "";
        }
      }


      if (fieldcode === "a" && kpirecord[fieldname]) {

        // if fieldcode is a (the first) and the kpirecord is not empty it means we are starting a new section
        // add the additional columns with post processing on the existing record
        // push the record to the array of current records

        const additionalcols = parsersettings.ADDITIONAL_COLUMNS;
        for (let i = 0; i < additionalcols.length; i++) {
          const col = additionalcols[i];
          kpirecord[col.colname] = col.colparser(kpirecord);
        }

        kpirecords.push(kpirecord);
      
        if (kpirecord["k"]) {
          console.error(kpirecord["Section"] + " :" + kpirecords.length);
        }

        kpirecord = {};

      }

      kpirecord[fieldname] = letter[2].replaceAll("\\", "").replace(/\.$/, "").trim();

      
    } else {

      if ( STATUS_READING_VALUE && line != "" && fieldname ) {
        let spacer = "";
        if (kpirecord[fieldname] != "") {
          spacer = "\n ";
        }
        kpirecord[fieldname] += `${spacer}${line}`;
      }
    }
  }
}

console.error("FINAL: " + kpirecords.length);
//console.log(JSON.stringify(kpirecords, null, "\t"));

const outfile = /.*\/(.*)\.[^\.]+$/.exec(filename)
const jsonoutfile = JSONOUTDIR + "/" + ( outfile ? outfile[1] + ".json" : "a.json" ) ;
const yamloutfile = YAMLOUTDIR + "/" + ( outfile ? outfile[1] + ".yaml" : "a.yaml" ) ;


console.error(`${filename} exported to: `);

await Deno.writeTextFile( jsonoutfile , JSON.stringify(kpirecords, null, "\t"));
console.error(`    JSON: ${jsonoutfile}`);

await Deno.writeTextFile( yamloutfile , stringify(kpirecords));
console.error(`    YAML: ${yamloutfile}`);



/*
5 KPI definitions template
==========================

a\) Name (Mandatory): This field shall contain the name of the KPI.

b\) Description (Mandatory): This field shall contain the description of
the KPI.
Within this field it should describe if the KPI is focusing on network
or user view. This filed should also describe the logical KPI formula to
derive the KPI. For example, a success rate KPI’s logical formula is the
number of successful events divided by all events. This field should
also show the KPI unit (e.g., kbit/s, millisecond) and the KPI type
(e.g., mean, ratio).

c\) Formula definition (Optional):
This field should contain the KPI formula using the 3GPP defined
measurement names.
This field can be used only when the measurement(s) needed for the KPI
formula are defined in 3GPP TS for performance measurements (TS 28.552
\[6\]). This field shall clarify how the aggregation shall be done, for
the KPI object level(s) defined in d).

d\) KPI Object (Mandatory):
This field shall contain the DN of the object instance where the KPI is
applicable, including the object where the measurement is made. The DN
identifies one object instance of the following IOC:

\- NetworkSliceSubnet

\- SubNetwork

\- NetworkSlice

\- NRCellDU

\- NRCellCU

e\) Remark (Optional):
This field is for additional information required for the KPI
definition,
e.g. the definition of a call in UTRAN.

*/
