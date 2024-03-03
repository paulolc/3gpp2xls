#!/bin/bash

pandoc -t markdown_strict --extract-media='./attachments/28552-i50' ./28552-i50\ -\ Management\ and\ Orchestration\ 5G\ PM\ -\ Release\ 18.docx -o 28552-i50.md
pandoc -t markdown_strict --extract-media='./attachments/28552-i50' ./28554-i40\ -\ Management\ and\ Orchestration\ 5G\ E2E\ KPIs\ -\ Release\ 18.docx -o 28552-i50.md
