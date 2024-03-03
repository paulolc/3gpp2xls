
# 3gpp2xls

Extract the 3GPP standard 5G Slicing KPIs and counters from 3GPP specifications documents in word format and export them to formats more appropriate for systematic and programmatic analysis like json, yaml and MS Excel

# Exported 3GPP specs

| Format         | Directory              |
|----------------|------------------------|
| Word (.docx)   | ./3gpp-specs_docx      |
| Markdown (.md) | ./3gpp-inputs_markdown |
| JSON (.json)   | ./3gpp-outputs_json    |
| YAML (.yaml)   | ./3gpp-outputs_yaml    |
| Excel (.xls)   | ./3gpp-exports_msexcel |

# Purpose

The objective of this project is to extract the 3GPP standard 5G Slicing KPIs and counters from 3GPP specifications documents originally in word format (.docx) and export them to formats more appropriate for systematic and programmatic analysis like json, yaml and excel.

3GPP Specs Exported:

- 3GPP TS 28.554 V18.4.0 (2023-12) - 5G end to end Key Performance Indicators (KPI)
- 3GPP TS 28.552 V18.5.0 (2023-12) - 5G performance measurements


# Requirements

- Deno

# Processing Steps

1. Convert 3gpp specs in word format (.docx) to Markdown

    Run docx2md.sh inside the 3gpp-spcs_docx directory

2. Parse converted markdown files to json and yaml

    Run i40-3gpp.sh and i50-3gpp.sh in the directory of this README file.

    NOTE: Multiple iterations were required to fix errors and inconsistencies in the converted markdown files

3. Import ouput json file in Excel

    NOTE: You can find the queries used for the json import in the 3gpp-exports_msexcel directory

