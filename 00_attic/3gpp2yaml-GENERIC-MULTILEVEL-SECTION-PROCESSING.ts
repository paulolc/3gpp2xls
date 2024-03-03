import {TextLineStream} from 'https://deno.land/std/streams/mod.ts';

let STATUS_STARTED, STATUS_INDEX_END, STATUS_READING_VALUE = false;
let CURRSECTION, CURRSECTION1, CURRSECTION2, CURRSECTION3;

const PARSER_MAPPINGS = {
  "3GPP TS 28.554 V18.4.0 (2023-12)": "28.554_i40_v1",
  "3GPP TS 28.552 V18.5.0 (2023-12)": "28.552_i50_v1"
}

const PARSER_SETTINGS = {
  "28.554_i40_v1" : {
    STATUS_INDEX_END_REGEX : new RegExp("^ Foreword"),
    STATUS_STARTED_REGEX: new RegExp("^6 End to end KPI definitions")
  }
}

const FIELD_NAMES = {
  "a": "Name",
  "b": "Description",
  "c": "Formula",
  "d": "KPI Object",
  "e": "Remark"
}

const file = await Deno.open(Deno.args[0]);

const lines = file.readable
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new TextLineStream());


let kpirecords:any = [];
let kpirecord = {};
let letter;
let fieldname;
let section;
let subsection1;
let subsection2;
let subsection3;
let ts3gpp;
let parsersettings;

let SUBSECTIONS;

const maxsectionlevels = 3; 
let CURRSECTIONS;

// ######


for await (const line of lines) {

  if( !ts3gpp ){
    ts3gpp=line;
    parsersettings = PARSER_SETTINGS[ PARSER_MAPPINGS[ts3gpp] ];
  }

  if( line.match( parsersettings.STATUS_INDEX_END_REGEX)){
    STATUS_INDEX_END = true;
  }

  if( STATUS_INDEX_END && line.match( parsersettings.STATUS_STARTED_REGEX )){
    STATUS_STARTED = true;
  }



  if( STATUS_STARTED ){

/*
    
    if(section = /^\s*(6(?:\.?[0-9]*){1,}) (.*)/.exec(line)){
    //if(section = /^\s*([0-9]+[0-9]*(?:\.?[0-9]*){1,}) (.*)/.exec(line)){
      CURRSECTION=`${section[2]} (${section[1]})`
      STATUS_READING_VALUE = false;
      CURRSECTION1 = undefined;
      CURRSECTION2 = undefined;
      CURRSECTION3 = undefined;
      //CURRSECTIONS = new Array(maxsectionlevels+1);
    } 
*/


/************************************************************************************************************************************************

// WORKS STANDALONE - ORIGINAL -> BASELINE

    if(subsection1 = /^\s*###\s*([0-9]+[0-9]*(?:\.?[0-9]*){1,}) (.*)/.exec(line)){
      CURRSECTION1=`${subsection1[2]} (${subsection1[1]})`
      STATUS_READING_VALUE = false;
      CURRSECTION2 = undefined;
      CURRSECTION3 = undefined;
    } 

    if(subsection2 = /^\s*####\s*([0-9]+[0-9]*(?:\.?[0-9]*){1,}) (.*)/.exec(line)){
      CURRSECTION2=`${subsection2[2]} (${subsection2[1]})`
      STATUS_READING_VALUE = false;
      CURRSECTION3 = undefined;
    } 

    if(subsection3 = /^\s*#####\s*([0-9]+[0-9]*(?:\.?[0-9]*){1,}) (.*)/.exec(line)){
      CURRSECTION3=`${subsection3[2]} (${subsection3[1]})`
      STATUS_READING_VALUE = false;
    } 


************************************************************************************************************************************************/

/************************************************************************************************************************************************

// IT WORKS IN STANDALONE !!!!

    for (let i = 1; i <= maxsectionlevels ; i++) {
      let subsection;
      const hashcharcount = i + 2;
      const sectionregex = new RegExp(`^\\s*[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}) (.*)`); 
//      const sectionregex = new RegExp(`^\\s*${ i==0 ? "6" : "[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*" }(?:\\.?[0-9]*){1,}) (.*)`); 
      if(subsection = sectionregex.exec(line)){
        CURRSECTIONS[i]=`${subsection[2]} (${subsection[1]})`
        STATUS_READING_VALUE = false;
        for(let k = i + 1  ; k <= maxsectionlevels + 2  ; k++ ){
          CURRSECTIONS[k] = undefined;
        }
        CURRSECTION1 = CURRSECTIONS[1];
        CURRSECTION2 = CURRSECTIONS[2];
        CURRSECTION3 = CURRSECTIONS[3];          
    }   
    }

    //console.assert(CURRSECTION  === CURRSECTIONS[0] , `(CURRSECTION)  expected: '${CURRSECTION }' got: '${CURRSECTIONS[0]}'`);
    console.assert(CURRSECTION1 === CURRSECTIONS[1] , `(CURRSECTION1) expected: '${CURRSECTION1}' got: '${CURRSECTIONS[1]}'`);
    console.assert(CURRSECTION2 === CURRSECTIONS[2] , `(CURRSECTION2) expected: '${CURRSECTION2}' got: '${CURRSECTIONS[2]}'`);
    console.assert(CURRSECTION3 === CURRSECTIONS[3] , `(CURRSECTION3) expected: '${CURRSECTION3}' got: '${CURRSECTIONS[3]}'`);
    
************************************************************************************************************************************************/


/************************************************************************************************************************************************/

// IT WORKS IN STANDALONE !!!!

for (let i = 0; i <= maxsectionlevels ; i++) {
  let subsection;
  const hashcharcount = i + 2;

  const commonregexstr = `^\\s*${ i===0 ? "(6" : "[#]{" + hashcharcount + "," + hashcharcount + "}\\s*([0-9]+[0-9]*" }(?:\\.?[0-9]*){1,}) (.*)`;
  const sectionregex = new RegExp(commonregexstr); 


  if(subsection = sectionregex.exec(line)){
    if( i === 0 ){
      CURRSECTIONS = new Array(maxsectionlevels+1);
    }

    CURRSECTIONS[i]=`${subsection[2]} (${subsection[1]})`
    STATUS_READING_VALUE = false;
    for(let k = i + 1  ; k <= maxsectionlevels + 2  ; k++ ){
      CURRSECTIONS[k] = undefined;
    }

    // TO DELETE WHEN NOT NEEDED:
    CURRSECTION  = CURRSECTIONS[0];
    CURRSECTION1 = CURRSECTIONS[1];
    CURRSECTION2 = CURRSECTIONS[2];
    CURRSECTION3 = CURRSECTIONS[3];          
}   
}

//console.assert(CURRSECTION  === CURRSECTIONS[0] , `(CURRSECTION)  expected: '${CURRSECTION }' got: '${CURRSECTIONS[0]}'`);
console.assert(CURRSECTION1 === CURRSECTIONS[1] , `(CURRSECTION1) expected: '${CURRSECTION1}' got: '${CURRSECTIONS[1]}'`);
console.assert(CURRSECTION2 === CURRSECTIONS[2] , `(CURRSECTION2) expected: '${CURRSECTION2}' got: '${CURRSECTIONS[2]}'`);
console.assert(CURRSECTION3 === CURRSECTIONS[3] , `(CURRSECTION3) expected: '${CURRSECTION3}' got: '${CURRSECTIONS[3]}'`);

/************************************************************************************************************************************************/



/*
    const genericregexstr = `^\\s*[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}) (.*)`;
    const specificregexstr = `^\\s*${ i===0 ? "6" : "[#]{" + hashcharcount + "," + hashcharcount + "}" }\\s*([0-9]+[0-9]*" }(?:\\.?[0-9]*){1,}) (.*)`;
    const regexstr = genericregexstr;
    console.assert(genericregexstr === specificregexstr , `(regexstr)\n      expected: '${specificregexstr}'\n           got: '${genericregexstr}'`);
*/


/************************************************************************************************************************************************

// DOES NOT WORK STANDALONE


    for (let i = 0; i <= maxsectionlevels ; i++) {
      let subsection;
      const hashcharcount = i + 2;
      const commonregexstr = `^\\s*${ i===0 ? "(6" : "[#]{" + hashcharcount + "," + hashcharcount + "}\\s*([0-9]+[0-9]*" }(?:\\.?[0-9]*){1,}) (.*)`;


      ////////////////////////////////////////////////////////////////////////////////
      const genericregexstr = `^\\s*[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}) (.*)`;
      const specificregexstr = `^\\s*(6(?:\\.?[0-9]*){1,}) (.*)`

      if( i === 0 ){
        console.assert(commonregexstr === specificregexstr , `(regexstr)\n      expected: '${specificregexstr}'\n           got: '${commonregexstr}'`);         
      } else {
        console.assert(commonregexstr === genericregexstr , `(regexstr)\n      expected: '${genericregexstr}'\n           got: '${commonregexstr}'`);
      }

      const sectionregexstr = `^\\s*[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}) (.*)`;
      const workingregexstr = `^\\s*${ i===0 ? "6" : "[#]{" + hashcharcount + "," + hashcharcount + "}" }\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}) (.*)`;
      ////////////////////////////////////////////////////////////////////////////////


      const sectionregex = new RegExp(commonregexstr); // new RegExp(workingregexstr); // new RegExp(sectionregexstr); 
      if(subsection = sectionregex.exec(line)){
        CURRSECTIONS[i]=`${subsection[2]} (${subsection[1]})`
        STATUS_READING_VALUE = false;
        for(let k = i + 1  ; k <= maxsectionlevels + 2  ; k++ ){
          CURRSECTIONS[k] = undefined;
        }
      }   
    }

    //console.assert(CURRSECTION  === CURRSECTIONS[0] , `(CURRSECTION)  expected: '${CURRSECTION }' got: '${CURRSECTIONS[0]}'`);
    console.assert(CURRSECTION1 === CURRSECTIONS[1] , `(CURRSECTION1) expected: '${CURRSECTION1}' got: '${CURRSECTIONS[1]}'`);
    console.assert(CURRSECTION2 === CURRSECTIONS[2] , `(CURRSECTION2) expected: '${CURRSECTION2}' got: '${CURRSECTIONS[2]}'`);
    console.assert(CURRSECTION3 === CURRSECTIONS[3] , `(CURRSECTION3) expected: '${CURRSECTION3}' got: '${CURRSECTIONS[3]}'`);

************************************************************************************************************************************************/






/************************************************************************************************************************************************


// IT WORKS BUT NOT STANDALONE

    for (let i = 1; i <= maxsectionlevels ; i++) {
      let subsection;
      const hashcharcount = i + 2;
      const sectionregex = new RegExp(`^\\s*[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*(?:\\.?[0-9]*){1,}) (.*)`); 
//      const sectionregex = new RegExp(`^\\s*${ i==0 ? "6" : "[#]{${hashcharcount},${hashcharcount}}\\s*([0-9]+[0-9]*" }(?:\\.?[0-9]*){1,}) (.*)`); 
      if(subsection = sectionregex.exec(line)){
        CURRSECTIONS[i]=`${subsection[2]} (${subsection[1]})`
        STATUS_READING_VALUE = false;
        for(let k = i + 1  ; k <= maxsectionlevels + 2  ; k++ ){
          CURRSECTIONS[k] = undefined;
        }
      }   
    }

    //console.assert(CURRSECTION  === CURRSECTIONS[0] , `(CURRSECTION)  expected: '${CURRSECTION }' got: '${CURRSECTIONS[0]}'`);
    console.assert(CURRSECTION1 === CURRSECTIONS[1] , `(CURRSECTION1) expected: '${CURRSECTION1}' got: '${CURRSECTIONS[1]}'`);
    console.assert(CURRSECTION2 === CURRSECTIONS[2] , `(CURRSECTION2) expected: '${CURRSECTION2}' got: '${CURRSECTIONS[2]}'`);
    console.assert(CURRSECTION3 === CURRSECTIONS[3] , `(CURRSECTION3) expected: '${CURRSECTION3}' got: '${CURRSECTIONS[3]}'`);


************************************************************************************************************************************************/



    if( letter = /^\s*([a-z]).\)(.*)/.exec(line) ){

      const fieldcode = letter[1];

      STATUS_READING_VALUE = true;
      fieldname = FIELD_NAMES[ fieldcode ]; 

      if( fieldname === "Name" && kpirecord[fieldname] ){
        kpirecord["Section"] = `${CURRSECTION} >> ${CURRSECTION1?CURRSECTION1:""}${CURRSECTION2?" >> " + CURRSECTION2:""}${CURRSECTION3? " >> " + CURRSECTION3:""}`; 
        kpirecord["Title"] = CURRSECTION3? CURRSECTION3 : CURRSECTION2? CURRSECTION2 : CURRSECTION1? CURRSECTION1 : CURRSECTION;
        kpirecords.push( kpirecord );

        console.error( kpirecord[ "Section" ] + " :" + kpirecords.length );
        kpirecord = {};
      } 

      kpirecord[ fieldname ] = letter[2].replaceAll('\\','').replace(/\.$/,'').trim()

    } else {
      if( STATUS_READING_VALUE && line != "" && fieldname){
        let spacer ="";
        if( kpirecord[ fieldname ] != "" ){
          spacer = "\n ";
        }
        kpirecord[ fieldname ] += `${spacer}${line}`;  
      } 
    }
  }

}


console.error("FINAL: " + kpirecords.length );

console.log(JSON.stringify(kpirecords,null,'\t'))






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