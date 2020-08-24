
require([
    "../js/bimtree/bimsurfer/src/BimServerModelLoader",
    "../js/bimtree/bimsurfer/src/StaticTreeRenderer",
    "../js/bimtree/bimsurfer/src/MetaDataRenderer",
    "../js/bimtree/bimsurfer/lib/domReady!",],
  function (BimServerModelLoader, StaticTreeRenderer, MetaDataRenderer) {
    function processBimSurferModel(bimSurferModel) {

      bimSurferModel.getTree().then(function (tree) {

        window.domtree = new StaticTreeRenderer({
          domNode: 'treeContainer'
        });
        domtree.addModel({name: "", id: lastRevisionId, tree: tree});
        domtree.build();
        window.metadata = new MetaDataRenderer({
          domNode: 'dataContainer'
        });

        metadata.addModel({name: "", id: lastRevisionId, model: bimSurferModel});

        // bimSurfer.on("selection-changed", function (selected) {
        //   domtree.setSelected(selected, domtree.SELECT_EXCLUSIVE);
        //   metadata.setSelected(selected);
        // });

        domtree.on("click", function (oid, selected) {
          metadata.setSelected(selected);
          console.log(selected);
        });

      });
    }

    
    var bimServerClient = new BimServerClient("http://localhost:8080", null);
    token = localStorage.getItem("token");
    bimServerClient.init(function () {
      bimServerClient.setToken(token, function () {
        var modelLoader = new BimServerModelLoader(bimServerClient);
        var models = {}; // roid -> Model

        var nrProjects;

        function loadModels(models) {

          for (var roid in models) {
            var model = models[roid];
            console.log("model",model);
            modelLoader.loadFullModel(model).then(function (bimSurferModel) {
              console.log("bimSurferModel",bimSurferModel);
              processBimSurferModel(bimSurferModel);
              //填充下拉框
              getModelOidAndName(bimSurferModel);
            });
          }
        }

        function getModelOidAndName(thisModel) {
          var modelObj = thisModel.apiModel.objects;
          Object.keys(modelObj).forEach(function (key) {
            if (modelObj[key].object.hasChildren === undefined) {
              var option = document.createElement("option");
              $(option).val(key);
              if (modelObj[key].object.Name === undefined || modelObj[key].object.Name === "") {
                $(option).text(key);
              } else {
                $(option).text(modelObj[key].object.Name);
              }
              $('#select').append(option);
            }
          });
        }
        console.log(myProject.oid);
        bimServerClient.call("ServiceInterface", "getAllRelatedProjects", {poid: myProject.oid}, function (projects) {
          nrProjects = projects.length;

          projects.forEach(function (project) {

            if (project.lastRevisionId !== -1) {
              //lastRevisionId
              bimServerClient.getModel(project.oid, project.lastRevisionId, project.schema, false, function (model) {
                models[project.lastRevisionId] = model;
                    nrProjects--;
                    if (nrProjects === 0) {
                      loadModels(models);
                    }
              });
            } else {
              nrProjects--;
              if (nrProjects === 0) {
                loadModels(models);
              }
            }
          });
        });
      });
    });
  });