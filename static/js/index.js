(function() {
  'use strict';

  const DEMO = [
    ['Berberis Sect. Wallichianae', '/matchataxa/static/mg-usage.csv', []],
    ['Acmella in Taiwan', '/matchataxa/static/mg-usage2.csv', []],
    ['Clematis subsection Pierotianae (Ranunculaceae)', '/matchataxa/static/mg-usage3.csv', []]
  ];

  let currentSelect = null;
  let currentTaxonKey = null;

  const loading = document.getElementById('loading');

  // read csv
  const readCSV = (index) => {
    let rowData = [];
    let counter = 0;
    Papa.parse(DEMO[index][1], {
      download: true,
      step: function(row) {
        //console.log("Row:", row.data);
        counter += 1;
        if (counter > 1) { // ignore header
          let typeList = [];
          let typeData = {};
          let commonName = '';
          let description = '';
          try {
            //# type specimen
            if (row.data[5]) {
              let d = JSON.parse(row.data[5]);
              let s = '';
              for (let i of d) {
                //console.log(i);
                let typeInfo = [];
                let typeOfType = '';
                if (i.use) {
                  typeOfType = `${i.use}: `;
                }
                //## locality
                if (i.country) {
                  typeInfo.push(i.country.display['en-us'].toUpperCase());
                }
                let loc = i.locality || i.locality_verbatim;
                if (loc) {
                  if (i.locality && i.locality_verbatim) {
                    loc = `${loc} (${i.locality_verbatim})`;
                  }
                  typeInfo.push(loc);
                }
                //## date
                let collectDate = [];
                if (i.collection_day) {
                  collectDate.push(i.collection_day);
                }
                if (i.collection_month) {
                  collectDate.push(i.collection_month);
                }
                if (i.collection_year) {
                  collectDate.push(i.collection_year);
                }
                if (collectDate.length > 0) {
                  typeInfo.push(collectDate.join(' '));
                }
                //## collector
                let fieldNumber = [];
                if (i.collector_ids.length > 0) {
                  // TODO: map id to name
                  fieldNumber.push('{' + i.collector_ids.join(', ') + '}');
                }
                if (i.collector_number) {
                  fieldNumber.push(i.collector_number);
                }
                if (fieldNumber.length > 0) {
                  typeInfo.push(fieldNumber.join(' '));
                }
                //## specimen
                let specimenList = [];
                let specimenCounter = 0;
                i.specimens.forEach( x => {
                  if (x.herbarium && x.accession_number) {
                    specimenCounter += 1;
                    if (specimenCounter === 1) {
                      specimenList.push(`${x.herbarium}[${x.accession_number}]`);
                    } else {
                      // TODO: auto add isotype?
                      specimenList.push(`isotype: ${x.herbarium}[${x.accession_number}]`);
                    }
                  }
                });
                let specimenStr = '';
                if (specimenList.length > 0) {
                  specimenStr = '(' + specimenList.join('; ') + ')';
                }
                typeList.push(typeOfType + typeInfo.join(', ') + specimenStr);
                typeData = [typeOfType, typeInfo, specimenList.join('; ')];
              }
              let d2 = JSON.parse(row.data[6]);
              if (d2 && d2.common_names) {
                commonName = d2.common_names.map( x => {
                  return x.name;
                }).join(', ');
              }
              description = d2.note;
            }
          } catch (err) {
            console.log(err);
          }
          rowData.push({
            'recid': counter,
            'taxon_name': `<i>${row.data[1]}</i> ${row.data[2]}`,
            'status': row.data[3],
            'type': typeList.join(' | '),
            'common_name': commonName,
            'description': description,
            'sourceData': row.data,
            'typeData': typeData,
          });
        } else {
          //console.log(row.data);
        }
      },
      complete: function() {
        //console.log("All done!");
        //console.log(rowData);
        DEMO[index][2] = rowData;
      }
    });
  };

  readCSV(0);
  readCSV(1);
  readCSV(2);

  // base layout
  let pstyle = 'border: 1px solid #efefef; padding: 5px';
  let layoutConf = {
    name: 'layout',
    padding: 0,
    panels: [
      { type: 'top', size: 40, style: pstyle, html: 'Biota Taiwanica' },
      { type: 'left', size: 160, resizable: true, style: pstyle, html: 'left' },
      { type: 'main', style: pstyle, html: 'main' },
      { type: 'right', size: 300, resizable: true, style: pstyle, html: 'right' }
    ]
  };
  let layout = new w2layout(layoutConf);

  let detailGrid = new w2grid({
    name: 'detail-grid',
    box: '#grid2',
    header: 'Details',
    show: { header: true, columnHeaders: false },
    columns: [
        { field: 'name', text: 'Name', size: '100px', style: 'background-color: #efefef; border-bottom: 1px solid white; padding-right: 5px;', attr: "align=right" },
        { field: 'value', text: 'Value', size: '100%' }
    ]
  });

  let mainGrid = new w2grid({
    name: 'main-grid',
    show: {
      selectColumn: true
    },
    columns: [
      { field: 'taxon_name', text: 'Scientific Name', size: '230px' },
      { field: 'common_name', text: 'Common Name', size: '100px' },
      { field: 'status', text: 'Status', size: '100px' },
      { field: 'type', text: 'Type Info', size: '350px' },
      { field: 'description', 'text': 'Description'},
    ],
    onClick(event) {
      let record = this.get(event.detail.recid);
      currentSelect = record;
      detailGrid.clear();
      let sd = record.sourceData;
      let typeOfType = '';
      let locality = '';
      let localityVerbatim = '';
      let country = '';
      let collector = '';
      if (sd[5]) {
        try {
          let d = JSON.parse(sd[5]);
          if (d && d[0]) {
            d = d[0]; // ignore Array
            typeOfType = d.use;
            locality = d.locality || '';
            localityVerbatim = d.locality_verbatim || '';
            country = (d.country) ? d.country.display['en-us'].toUpperCase() : '';
          }
        } catch (err) {
          console.error(err);
        }
      }
      let data = [
        { recid: 0, name: '#', value: record.recid },
        { recid: 1, name: 'Taxon Name:', value: record.taxon_name },
        { recid: 2, name: 'Common Name:', value: record.common_name },
        { recid: 3, name: 'Status:', value: record.status },
        { recid: 4, name: 'Type of Type', value: record.typeData[0] },
      ];
      let counter = 4;
      if (sd[5].length > 0 && record.typeData.length > 0) {
        record.typeData[1].forEach( x => {
          counter += 1;
          data.push({recid: counter, name: '', value: x});
        });
        if (record.typeData[2]) {
          data.push({recid: counter+1, name: 'Specimen', value: record.typeData[2]});
        }
      }
      data.push({ recid: counter, name: 'Description:', value: record.description });
      if (sd[6].length > 0) {
        try {
          let d = JSON.parse(sd[6]);
          if (d.custom_fields) {
            d.custom_fields.forEach( x => {
              counter += 1;
              data.push({recid: counter, name: `[自訂欄位]<br>${x.field_name_en}`, value: `[${x.field_name_zh}]: ${x.field_value}`});
            });
          }
        } catch (err) {
          console.error(err);
        }
      }
      detailGrid.add(data);
    }
  });

  let sidebarConf =  {
      name: 'sidebar',
      nodes: [
        { id: 'general', text: 'General', group: true, expanded: true, nodes: [
          { id: 'grid1', text: DEMO[0][0], icon: 'fa fa-table square-o', selected: true },
          { id: 'grid2', text: DEMO[1][0], icon: 'fa fa-table square-o' },
          { id: 'grid3', text: DEMO[2][0], icon: 'fa fa-table square-o' },
          { id: 'html', text: 'Some HTML', icon: 'fa fa-list-alt' }
        ]}
      ],
      onClick(event) {
        switch (event.target) {
        case 'grid1':
          mainGrid.clear();
          mainGrid.add(DEMO[0][2]);
          layout.html('main', mainGrid);
          break;
        case 'grid2':
          mainGrid.clear();
          mainGrid.add(DEMO[1][2]);
          layout.html('main', mainGrid);
          break;
        case 'grid3':
          mainGrid.clear();
          mainGrid.add(DEMO[2][2]);
          layout.html('main', mainGrid);
          break;
        case 'html':
          layout.html('main', '<div style="padding: 10px">Some HTML</div>');
          query(layout.el('main'))
            .removeClass('w2ui-grid')
            .css({
              'border-left': '1px solid #efefef'
            });
          break;
        }
      }
    };
    let sidebar = new w2sidebar(sidebarConf);


  // initialization
  layout.render('#main');
  layout.html('left', sidebar);
  layout.html('main', mainGrid);
  layout.html('right', detailGrid);

  // toolbar
  new w2toolbar({
    box: '#toolbar',
    name: 'toolbar',
    items: [
      { type: 'button', id: 'item1', text: 'GBIF: Find taxonKey', icon: 'fa fa-tree' },
      { type: 'button', id: 'item7', text: 'GBIF: Find Specimen', icon: 'fa fa-bolt' },
      { type: 'break' },
      { type: 'check', id: 'item2', text: 'Check 1', icon: 'w2ui-icon-check' },
      { type: 'check', id: 'item3', text: 'Check 2', icon: 'w2ui-icon-check' },
      { type: 'break' },
      { type: 'radio', id: 'item4', group: '1', text: 'Radio 1', icon: 'w2ui-icon-info', checked: true },
      { type: 'radio', id: 'item5', group: '1', text: 'Radio 2', icon: 'w2ui-icon-paste' },
      { type: 'spacer' },
      { type: 'button', id: 'item6', text: 'Button', icon: 'w2ui-icon-cross' }
    ],
    onClick(event) {
      console.log('Target: '+ event.target, event);
      if (event.target === 'item1') {
        let scientificName = currentSelect.sourceData[1];
        loading.style = 'display: block';
        fetch(`https://api.gbif.org/v1/species/search?q=${scientificName}&rank=SPECIES&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`)
        .then(resp => resp.json())
          .then(result => {
            loading.style = 'display: none';
            console.log(result);
            w2popup.open({
              title: 'Popup',
              width: 800,
              height: 600,
              showMax: true,
              body: '<div id="taxon-grid" style="position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px;"></div>'
            })
              .then(() => {
                let taxonGrid = new w2grid({
                  name: 'taxon-grid',
                  box: '#taxon-grid',
                  style: 'border: 0px; border-left: 1px solid #efefef',
                  columns: [
                    { field: 'key', text: 'taxonKey', size: '80px' },
                    { field: 'scientificName', text: 'Scientific Name', size: '250px' },
                    { field: 'status', text: 'Status', size: '80px' },
                    { field: 'accordingTo', text: 'According To', size: '280px', attr: 'align="center"' }
                  ],
                  onClick(event) {
                    let record = this.get(event.detail.recid);
                    //console.log(record);
                    currentTaxonKey = record.key;
                    let taxon = document.getElementById('taxon');
                    taxon.style = 'display: block';
                    taxon.textContent = record.scientificName;
                  }
                });
                let da = result.results.map( (v, i) => {
                  console.log(v);
                  let sciName = v.species;
                  if (v.authorship) {
                    sciName = `${sciName} ${v.authorship}`;
                  }
                  return {
                    recid: i,
                    key: v.speciesKey,
                    scientificName: sciName,
                    accordingTo: v.accordingTo,
                    status: v.taxonomicStatus,
                  };
                });
                taxonGrid.add(da);
              });
          });
      } else if (event.target === 'item7' && currentTaxonKey) {
        loading.style = 'display: block';
        fetch(`https://api.gbif.org/v1/occurrence/search?basisOfRecord=PreservedSpecimen&taxon_key=${currentTaxonKey}`)
          .then(resp => resp.json())
          .then(result => {
            loading.style = 'display: none';
            console.log(result);
            let spGrid = new w2grid({
              name: 'specimen-grid',
              box: '#specimen-grid',
              style: 'border: 0px; border-left: 1px solid #efefef',
              columns: [
                { field: 'recordedBy', text: 'Collector', size: '100px' },
                { field: 'recordNumber', text: 'Coll. Number', size: '80px' },
                { field: 'country_code', text: 'Country', size: '40px' },
                { field: 'locality', text: 'Locality', size: '250px' },
                { field: 'county', text: 'County', size: '120px' },
                { field: 'institution', text: 'Institution', size: '100px'},
                { field: 'catalogNumber', text: 'Catalog Number', size: '180px' },
              ],
            });
            let data = result.results.map((v, i) => {
              return {
                recid: i,
                country_code: v.countryCode,
                locality: v.locality,
                county: v.county || '',
                institution: v.institutionCode,
                catalogNumber: v.catalogNumber,
                recordNumber: v.recordNumber,
                recordedBy: v.recordedBy,
              };
            });
            spGrid.add(data);
          });
      }
    }
  });

})();
