geoModels={};

geoModels.glasgow={};
geoModels.glasgow._name='Glasgow 3D Geological Model';
geoModels.glasgow._uri='http://www.bgs.ac.uk/science/landUseAndDevelopment/urban_geoscience/clyde/';
//geoModels.glasgow._layers=['glasgow_mgr','glasgow_head','glasgow_p','glasgow_lac','glasgow_law','glasgow_kel','glasgow_guf','glasgow_karn','glasgow_liwd','glasgow_pais','glasgow_bron','glasgow_ross_sand','glasgow_ross_sz','glasgow_bill','glasgow_bhse','glasgow_bhse_sand1','glasgow_witi','glasgow_cadr','glasgow_brll','glasgow_bnti','glasgow_sagr1'];
//Original list above, removed some which don't seem to be working until work out what's gone wrong.
//glasgow_sagr1 only has 5 non-null cells, haven't checked if 4 of them make a square to draw one cell but not worth including.
geoModels.glasgow._layers=['glasgow_mgr','glasgow_head','glasgow_p','glasgow_lac','glasgow_law','glasgow_kel','glasgow_guf','glasgow_karn','glasgow_liwd','glasgow_pais','glasgow_bron','glasgow_ross_sz','glasgow_bill','glasgow_bhse','glasgow_bhse_sand1','glasgow_witi','glasgow_cadr','glasgow_brll','glasgow_bnti'];

//geoModels.glasgow.glasgow_base_model={"code":"glasgow_base_model","name":"Glasgow model","rockCode":"","limits":['top','base']};
geoModels.glasgow.glasgow_bhse={"code":"glasgow_bhse","name":"Broomhouse Sand and Gravel Formation","rockCode":"BHSE","limits":['top','base'],"colour":[254,200,254]};
geoModels.glasgow.glasgow_bhse_sand1={"code":"glasgow_bhse_sand1","name":"Sandier parts of Broomhouse Sand &amp; Gravel Formation","rockCode":"BHSE","limits":['top','base'],"colour":[254,200,254]};
geoModels.glasgow.glasgow_bill={"code":"glasgow_bill","name":"Bellshill Clay Formation","rockCode":"BILL","limits":['top','base'],"colour":[102,255,0]};
geoModels.glasgow.glasgow_bnti={"code":"glasgow_bnti","name":"Baillieston Till Formation","rockCode":"BNTI","limits":['top','base'],"colour":[139,231,255]};
geoModels.glasgow.glasgow_brll={"code":"glasgow_brll","name":"Broomhill Clay Formation","rockCode":"BRLL","limits":['top','base'],"colour":[212,255,113]};
geoModels.glasgow.glasgow_bron={"code":"glasgow_bron","name":"Bridgeton Sand Member","rockCode":"BRON","limits":['top','base'],"colour":[254,174,0]};
geoModels.glasgow.glasgow_cadr={"code":"glasgow_cadr","name":"Cadder Sand and Gravel Formation","rockCode":"CADR","limits":['top','base'],"colour":[255,171,165]};
geoModels.glasgow.glasgow_guf={"code":"glasgow_guf","name":"Gourock Formation","rockCode":"GUF","limits":['top','base'],"colour":[254,254,174]};
geoModels.glasgow.glasgow_head={"code":"glasgow_head","name":"Head","rockCode":"HEAD","limits":['top','base'],"colour":[194,164,134]};
geoModels.glasgow.glasgow_karn={"code":"glasgow_karn","name":"Killearn Sand and Gravel Member","rockCode":"KARN","limits":['top','base'],"colour":[254,83,50]};
geoModels.glasgow.glasgow_kel={"code":"glasgow_kel","name":"Strathkelvin Clay and Silt Member","rockCode":"KELV","limits":['top','base'],"colour":[237,201,147]};
geoModels.glasgow.glasgow_lac={"code":"glasgow_lac","name":"Laminated Clays","rockCode":"LAC","limits":['top','base'],"colour":[102,204,204]};
geoModels.glasgow.glasgow_law={"code":"glasgow_law","name":"Law Sand and Gravel Member","rockCode":"LAWSG","limits":['top','base'],"colour":[255,255,175]};
geoModels.glasgow.glasgow_liwd={"code":"glasgow_liwd","name":"Linwood Clay Member","rockCode":"LIWD","limits":['top','base'],"colour":[231,255,139]};
geoModels.glasgow.glasgow_mgr={"code":"glasgow_mgr","name":"Made Ground (Undivided)","rockCode":"MGR","limits":['top','base'],"colour":[110,76,51]};
geoModels.glasgow.glasgow_p={"code":"glasgow_p","name":"Peat (recent)","rockCode":"","limits":['top','base'],"colour":[218,174,116]};
geoModels.glasgow.glasgow_pais={"code":"glasgow_pais","name":"Paisley Clay Member","rockCode":"PAIS","limits":['top','base'],"colour":[163,240,140]};
geoModels.glasgow.glasgow_ross_sand={"code":"glasgow_ross_sand","name":"Ross Formation (Glaciofluvial and/or Glaciolacustrine)","rockCode":"ROSS","limits":['top','base'],"colour":[255,239,248]};
geoModels.glasgow.glasgow_ross_sz={"code":"glasgow_ross_sz","name":"Ross Formation (Glaciolacustrine deltaic)","rockCode":"ROSS","limits":['top','base'],"colour":[255,239,248]};
geoModels.glasgow.glasgow_sagr1={"code":"glasgow_sagr1","name":"Suballuvium Gravel","rockCode":"SAGR","limits":['top','base'],"colour":[255,204,255]};
geoModels.glasgow.glasgow_witi={"code":"glasgow_witi","name":"Wilderness Till Formation","rockCode":"WITI","limits":['top','base'],"colour":[83,203,253]};
