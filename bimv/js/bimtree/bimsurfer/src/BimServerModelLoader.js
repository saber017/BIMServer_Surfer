define(["./BimServerModel", "./PreloadQuery"],
 function(BimServerModel, PreloadQuery,) { 
    
    function BimServerModelLoader(bimServerClient) {
    	
    	var o = this;
    	
    	this.loadFullModel = function(apiModel){
    		return new Promise(function(resolve, reject) {
    			var model = new BimServerModel(apiModel);
				console.log("model",model,PreloadQuery);
    			apiModel.query(PreloadQuery, function () {}).done(function(){
    				var oids = [];
    				apiModel.getAllOfType("IfcProduct", true, function(object){
						//console.log("object.oid",object.oid);
    					oids.push(object.oid);
					});
					//console.log("oids",oids);
    				o.loadOids(model, oids);
    				resolve(model);
                });
    		});
    	};
    	
    	this.loadObjects = function(apiModel, objects){
    		return new Promise(function(resolve, reject) {
    			var model = new BimServerModel(apiModel);

				var oids = [];
				objects.forEach(function(object){
					oids.push(object.oid);
				});
				o.loadOids(model, oids);
				resolve(model);
    		});
    	};
    	
    	this.loadOids = function(model, oids){
			console.log("loadOids",model, oids);
            var oidToGuid = {};
            var guidToOid = {};

            var oidGid = {};
            
            oids.forEach(function(oid){
            	model.apiModel.get(oid, function(object){
            		if (object.object._rgeometry != null) {
            			var gid = object.object._rgeometry;
            			var guid = object.object.GlobalId;
            			oidToGuid[oid] = guid;
            			guidToOid[guid] = oid;
            			oidGid[gid] = oid;
            		}
            	});
            });
            

    	}
    	
    	this.setGlobalTransformationMatrix = function(globalTransformationMatrix) {
    		o.globalTransformationMatrix = globalTransformationMatrix;
    	}
    }
    
    BimServerModelLoader.prototype = Object.create(BimServerModelLoader.prototype);

    return BimServerModelLoader;
});