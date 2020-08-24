import {Address} from "./address.js";
import {BimServerClient} from "http://localhost:8080/apps/bimserverjavascriptapi/bimserverclient.js"
import {BimServerApiPromise} from "http://localhost:8080/apps/bimserverjavascriptapi/bimserverapipromise.js"
import {BimServerViewer} from "../viewer/bimserverviewer.js"
import {BimSurfer} from "../viewer/bimsurfer.js";
import {Credentials} from "./credentials.js"
import {Stats} from "../viewer/stats.js"
import {ProjectTreeModel} from "../viewer/projecttreemodel.js"
import {TreeView} from "../viewer/treeview.js"
import {Settings} from "../viewer/settings.js"
export class Minimal {

	constructor() {
		// You need to change these to something that makes sense
		this.demoSettings = {
			// Address of your BIMserver
			bimServerAddress: Address.getApiAddress(),
			// Project ID of the project you want to load the latest revision from
			poid: 131073,
			// The settings for the viewer
			viewerSettings: {
				// Not putting anything here will just use the default settings
			}
		};
	}
	
	start() {
		var surfer = window.bimSurfer = new BimSurfer();
		// Connect to a BIMserver
		var api=window.api = new BimServerClient(this.demoSettings.bimServerAddress);
		// Initialize the API
		api.init().then(() => {
			new Credentials(api).getCredentials().then(() => {
				this.loadModel(myProject);
				//this.loadProjects(api);
			});

		});
		
		
	}
//加载出所有项目的结构树
	loadProjects(api) {
		document.getElementById("projectsWrapper").style.display = "block";

		var treeView = new TreeView(document.getElementById("projects"));
		this.projectTreeModel = new ProjectTreeModel(api, treeView);
		this.projectTreeModel.load((node) => {
			console.log("node",node);
			this.loadModel(node.project);
		});
	}
	
	loadModel(project) {

		this.animationEnabled = false;
		
		var canvasWrapper = document.getElementById("canvasWrapper");
		this.canvas = document.createElement("canvas");
		this.olacanvas=document.querySelector("canvas");
		if(this.olacanvas){
			this.olacanvas.remove();
		}		
		this.canvas.className = "full";
		this.canvas.style.background="rgba(215, 255, 240, 0.45)";
		this.canvas.id="glcanvas";
		canvasWrapper.appendChild(this.canvas);
		//window.bimSurfer.cleanup();
		var stats = new Stats();
		
		stats.setParameter("Models", "Name", project.name);
		

		document.addEventListener("keypress", this.keyPressHandler);
		
		document.getElementById("back").addEventListener("click", () => {
			//console.log("back");
			if (window.bimSurfer!= null) {
				document.removeEventListener("keypress", this.keyPressHandler);
				window._debugViewer = null;
				window.tilingRenderLayer = null;
				window.defaultRenderLayer = null;
				this.canvas.remove();
				this.canvas = null;
				window.bimSurfer.cleanup();
				window.bimSurfer._bimServerViewer = null;
			}
			window.history.go(-1);
			//this.loadProjects();
		});

		$("#reset").click(function(event){
			window.bimSurfer.reset({cameraPosition: true, colors: true, visibility: true});
		});
		$("#hide").click(function(event){
			window.bimSurfer.setVisibility(this.selectedElements, false, false);
			//window.bimSurfer._bimServerViewer.selectedElements.clear();
		});
		$("#show").click(function(event){
			window.bimSurfer.reset({cameraPosition: false, colors: false, visibility: true});
		});
		$("#screenshot").click(function(event){
			window.bimSurfer.screenshot("#glcanvas");
			//window.bimSurfer._bimServerViewer.selectedElements.clear();
		});
		$("#camera-left").click(function(event){
			window.bimSurfer.setCameraQuick([1,0,0]);
		});
		$("#camera-right").click(function(event){
			window.bimSurfer.setCameraQuick([-1,0,0]);
		});
		$("#camera-up").click(function(event){
			window.bimSurfer.setCameraQuick([0,1,0]);
		});
		$("#camera-down").click(function(event){
			window.bimSurfer.setCameraQuick([0,-1,0]);
		});

		$("#camera-top").click(function(event){
			window.bimSurfer.getStats();
			window.bimSurfer.setCameraQuick([0,0,1]);
		});
		
		window.bimSurfer.load({
				api: window.api, 
				roid:project.revisions[0],
				domNode:document.querySelector("canvas")

		});
	}

	stringify(x) {
		function pre(v) {
			if (v.BYTES_PER_ELEMENT) {
				return Array.from(v);
			} else if ((v instanceof Object) && !(v instanceof Array)) {
				let r = {};
				Object.keys(v).forEach((k) => {
					r[k] = pre(v[k]);
				});
				return r;
			} else {
				return v;
			}
		}
		return JSON.stringify(pre(x));
	}

	errorHandler(message) {
		console.error(message);
		let canvas = document.getElementsByTagName("canvas")[0];
		let error = document.createElement("div");
		error.className = "error";
		error.innerHTML = `<span>${message}</span>`
		canvas.parentElement.insertBefore(error, canvas);
		canvas.parentElement.removeChild(canvas);
	}

	
}
new Minimal().start();