/**
 * A basic tree view. Used for the ProjectTree at the moment.
 */
export class TreeView {
	constructor(rootElement) {
		this.rootElement = rootElement;
	}
	
	show(node) {
		var projectNode = document.createElement("div");
		projectNode.classList.add("colorChange");
		var subDiv = document.createElement("div");
		node.img = document.createElement("img");
		node.img.classList.add("arrow");
		node.img.addEventListener("click", (event) => {
			node.toggle();
		});
		var div=document.createElement("div");
		div.classList.add("col-md-4");
		div.classList.add("nodetype1");
		div.appendChild(node.img);
		projectNode.appendChild(div);
		
		node.element = projectNode;
		var a = document.createElement("a");
		//a.classList.add("col-md-4");
		a.classList.add("nodetype");
		div.appendChild(a);
		a.addEventListener("click", (event) => {
			event.preventDefault();
			node.click();
		})
//
		var ifcButton= document.createElement("button");
		projectNode.appendChild(ifcButton)
		ifcButton.innerHTML="<span class='fa fa-upload'>&nbsp; IFC</span>";
		ifcButton.classList.add("btn")
		ifcButton.classList.add("btn-default")
		ifcButton.classList.add("mybtn")
		ifcButton.addEventListener("click",(event)=>{
			//console.log("ifcnodeinfo",node);
			$("#poid3").val(node.project.oid);
			$("#bimName3").val(node.project.name);
			$("#description3").val(node.project.description);
			$("#uploadIFC").modal('show');
		})

		//
		var addButton= document.createElement("button");
		projectNode.appendChild(addButton)
		addButton.innerHTML="<span class='fa fa-plus'>&nbsp; 子项目</span>"
		addButton.classList.add("btn")
		addButton.classList.add("btn-default")
		addButton.classList.add("mybtn")
		addButton.addEventListener("click",(event)=>{
			//console.log("addsubnodeinfo",node)
			$("#parentPoid").val(node.project.oid);
			$("#parentName").val(node.project.name);
			$("#addSubProject").modal('show');
		})

		var deleteButton= document.createElement("button");
		projectNode.appendChild(deleteButton)
		deleteButton.innerHTML="<span class='fa fa-trash'>&nbsp; 删除</span>";
		deleteButton.classList.add("btn")
		deleteButton.classList.add("btn-default")
		deleteButton.classList.add("mybtn")
		deleteButton.addEventListener("click",(event)=>{
			//console.log("deletenodeinfo",node);
			$("#poid4").val(node.project.oid);
			$("#bimName4").val(node.project.name);
			$("#description4").val(node.project.description);
			$("#deleteProject").modal('show');
			//alert("删除项目");
		})

		//
		a.innerHTML = '<span class="fa fa-file"><span>&nbsp;'+node.label;
		if (node.parent == null) {
			this.rootElement.appendChild(projectNode);
		} else {
			node.parent.subDiv.appendChild(projectNode);
		}
		
		subDiv.style["margin-left"] = "20px";
		projectNode.appendChild(subDiv);
		node.subDiv = subDiv;
		node.subDiv.hidden = true;
	}
	
	expanded(node) {
		node.img.classList.remove("arrowclosed");
		node.img.classList.add("arrowopen");
		node.subDiv.hidden = false;
	}
	
	collapsed(node) {
		node.img.classList.remove("arrowopen");
		node.img.classList.add("arrowclosed");
		node.subDiv.hidden = true;
	}
}