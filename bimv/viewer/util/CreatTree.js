import { StaticTreeRenderer } from "./StaticTreeRenderer.js";
import { MetaDataRenderer } from "./MetaDataRenderer.js";

export class CreatTree {
    constructor(bimSurferModel,bimSurfer,roid) {
        this.bimSurferModel=bimSurferModel;
        this.bimSurfer=bimSurfer;
        this.roid=roid;

    }
    treeLoad(){
    bimServerClient.setToken(token, function() {
        // Create a model loader, this one is able to load models from a BIMserver and therefore can have BIMserver specific calls
        var modelLoader = new BimServerModelLoader(bimServerClient, bimSurfer);
        
        var models = {}; // roid -> Model
        
        // For this example, we'll fetch all the latest revisions of all the subprojects of the main project
        var poid = QueryString.poid;
        
        var nrProjects;
        
        function loadModels(models, totalBounds) {
            var center = [
                (totalBounds.min[0] + totalBounds.max[0]) / 2,
                (totalBounds.min[1] + totalBounds.max[1]) / 2,
                (totalBounds.min[2] + totalBounds.max[2]) / 2
            ];
                
            var globalTransformationMatrix = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                -center[0], -center[1], -center[2], 1
            ];
            
            for (var roid in models) {
                var model = models[roid];
                // Example 1: Load a full model
                modelLoader.setGlobalTransformationMatrix(globalTransformationMatrix);
                modelLoader.loadFullModel(model).then(function(bimSurferModel){
                    creatTree(roid, bimSurferModel);
                });

            }
        }
    })
}
    creatTree(roid, bimSurferModel) {
        this.bimSurferModel.getTree().then(
            function (tree) {
            // Build a tree view of the elements in the model. The fact that it
            // is 'static' refers to the fact that all branches are loaded and
            // rendered immediately.
            var domtree = new StaticTreeRenderer({
                domNode: 'treeContainer'
            });
            domtree.addModel({ name: "", id: roid, tree: tree });
            domtree.build();

            // Add a widget that displays metadata (IfcPropertySet and instance
            // attributes) of the selected element.
            var metadata = new MetaDataRenderer({
                domNode: 'dataContainer'
            });
            metadata.addModel({ name: "", id: roid, model: bimSurferModel });

            bimSurfer.on("selection-changed", function (params) {
                domtree.setSelected(params.objects, domtree.SELECT_EXCLUSIVE);
                metadata.setSelected(params.objects);

                console.log("Clicked", params.clickPosition);
            });

            domtree.on("click", function (oid, selected) {
                // Clicking an explorer node fits the view to its object and selects
                if (selected.length) {
                    bimSurfer.viewFit({
                        ids: selected,
                        animate: true
                    });
                }
                bimSurfer.setSelection({
                    ids: selected,
                    clear: true,
                    selected: true
                });
            })
        })       
    }

}