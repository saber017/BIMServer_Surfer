import {Address} from "./address.js";
import {BimServerClient} from "../../bimserverjavascriptapi/bimserverclient.js"
import {BimServerViewer} from "../viewer/bimserverviewer.js"
import {Stats} from "../viewer/stats.js"
import {Settings} from "../viewer/settings.js"
import {ProjectTreeModel} from "../viewer/projecttreemodel.js"
import {TreeView} from "../viewer/treeview.js"
import {Credentials} from "./credentials.js"

/*
 * This class is where the applications starts, it's a mess, needs to go when we change this into an API
 */

export class Dev {

	start() {
		this.animationEnabled = false;

		this.settingsView = new Settings(document.getElementById("settings"));
		document.getElementById("backButton").addEventListener("click", () => {
			if (this.bimServerViewer != null) {
				document.removeEventListener("keypress", this.keyPressHandler);
				window._debugViewer = null;
				window.tilingRenderLayer = null;
				window.defaultRenderLayer = null;
				this.canvas.remove();
				this.canvas = null;
				this.bimServerViewer.cleanup();
				this.bimServerViewer = null;
			}
			//this.loadProjects();
		});
		
		// Deep-clone the settings, so we know we have a non-changing view of the settings
		this.settings = JSON.parse(JSON.stringify(this.settingsView.settings));
		this.settings.drawTileBorders = true;
		
		this.api = new BimServerClient(Address.getApiAddress());
		this.api.init(() => {
			new Credentials(this.api).getCredentials().then(() => {
				this.loadProjects();
			});
		});
	}

	loadProjects() {
		document.getElementById("viewer").style.display = "none";
		document.getElementById("projectsWrapper").style.display = "block";

		var treeView = new TreeView(document.getElementById("projects"));
		this.projectTreeModel = new ProjectTreeModel(this.api, treeView);
		this.projectTreeModel.load((node) => {
			console.log("node:"+node);
			this.loadModel(node.project);
		});
	}
	
	keyPressListener(event) {
		if (event.key == ' ') {
			event.preventDefault();
			this.animationEnabled = !this.animationEnabled;
			this.bimServerViewer.viewer.navigationActive = this.animationEnabled;
		}
	}

	loadModel(project) {
		document.getElementById("projectsWrapper").style.display = "none";
		document.getElementById("viewer").style.display = "block";

		this.animationEnabled = false;
		
		var canvasWrapper = document.getElementById("canvasWrapper");
		this.canvas = document.createElement("canvas");
		this.canvas.className = "full";
		canvasWrapper.appendChild(this.canvas);

		var stats = new Stats();
		
		stats.setParameter("Models", "Name", project.name);
		
		this.bimServerViewer = new BimServerViewer(this.settings, this.canvas, window.innerWidth, window.innerHeight, stats);
		
		this.bimServerViewer.setProgressListener((percentage) => {
			document.getElementById("progress").style.display = "block";
			document.getElementById("progress").style.width = percentage + "%";
			if (percentage == 100) {
				document.getElementById("progress").style.display = "none";
			}
		});

		this.bimServerViewer.viewer.addAnimationListener((deltaTime) => {
			if (this.animationEnabled) {
				this.bimServerViewer.viewer.camera.orbitYaw(0.3);
			}
		});

		this.keyPressHandler = (event) => {
			this.keyPressListener(event);
		};
		document.addEventListener("keypress", this.keyPressHandler);
		
		this.bimServerViewer.loadModel(this.api, project);
	}
}

new Dev().start();