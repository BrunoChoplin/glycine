
	var glycine;
	var svg;
	var tiges = [];
	var nbTiges = 3;
	var nbMaxFleurs = 5;
	var force = 1.5;
	var lotChute = 10;
	var Zindex = 2000;
	var etat = "en_fleur";
// --------- largeur et hauteur de la fenetre
	var W = window.innerWidth;
	var H = window.innerHeight;

// --------- update W et H lors d'un resize de la fenetre
	function wResize() {
	    W = window.innerWidth;
		H = window.innerHeight;
		svg.setAttribute("width", W);
		svg.setAttribute("height", H);
	}
	function init() {
		glycine = document.getElementById("glycine");
		svg = document.getElementById("mySvg");
		window.onresize = wResize;
		wResize();
		if (H > 800) nbTiges = 5
		else nbTiges = 3;
		if (W > 1500) nbMaxFleurs = 9;
		else if (W > 800) nbMaxFleurs = 7;
		else nbMaxFleurs = 5;
		for (let i=0; i<nbTiges; i++) {
			let maTige = new Tige(i);
			tiges.push(maTige);
		}
		window.onclick = faitTomber;
		bouge();
	}

	function bouge() {
		let delai = 2 + rnd(3);
		let dAngleX = PM(rnd(5));
		let dAngleY = PM(rnd(10));
		glycine.style.transform = mat3dToCSS(matRotate3d(dAngleX,dAngleY,0));
		glycine.style.transitionDuration = delai + "s";
		let t = setTimeout(bouge, delai*1000);
	}
	class Tige {
		constructor(id) {
			this.id = id;
			this.x = -100;
			this.y = (id+1)*H/(nbTiges+1) + zPM(rnd(3)*H/40);
			this.l = W - rnd(3)*W/10;
			this.sens = PM();
			this.n1 = 0;
			this.n2 = 0;
			this.tige = document.getElementById("path_"+id);
			this.nbFleurs = Math.max(3, rnd(nbMaxFleurs)); 		// entre 3 et nbMaxFleur
			this.fleurs = [];
			for (let i=0; i<this.nbFleurs; i++) {
				let maFleur = new Fleur(this,i);
				this.fleurs.push(maFleur);
			}
			this.enFeuille();
			this.bouge();	
		}
		bouge() {
			this.dessine()
			this.delai = Math.floor(Math.random()*500 + 2000/force);
			let t = setTimeout(this.bouge.bind(this), this.delai);
		}
		dessine() {
			this.n2 = PM(rnd(10)) + this.sens*rnd(force*10);
			var pathD = "M " + this.x + "," + this.y + " Q " + this.l/2 + "," + (this.y + this.n2) + " " + (this.l + zPM(rnd(40))) + "," + (this.y + this.n1*2);
			this.tige.setAttribute("d",pathD);
			for (let i=0; i<this.nbFleurs; i++) {
				let fleur = document.getElementById("path_"+this.id+"_"+i);
				let corole = document.getElementById("corole_"+this.id+"_"+i);
				fleur.style.offsetPath = "path('" + pathD + "')";
				corole.style.offsetPath = "path('" + pathD + "')";
				corole.style.transitionDuration = this.delai + "ms";
			}
			this.tige.style.transitionDuration = this.delai + "ms";
			this.n1 = this.n2;
		}
		enFeuille() {
			for (let i=0; i<this.nbFleurs; i++) {
				this.fleurs[i].enFeuille();
			}
		}
	}
	
	class Fleur {
		constructor(tige, id) {
			this.tige = tige;
			this.id = id;
			this.pos = 20 + Math.floor((100-10)*id/this.tige.nbFleurs) + zPM(3);
			this.sens = PM();
			this.n1 = 0;
			this.n2 = 0;
			this.fleur = document.getElementById("path_"+this.tige.id+"_"+this.id);
			this.corole = document.getElementById("corole_"+this.tige.id+"_"+this.id);
			this.fleur.style.offsetDistance = this.pos + "%";
			this.corole.style.offsetDistance = this.pos + "%";
			this.nbPetales = Math.floor(Math.random()*10) + 20;						// entre 30 et 50 
			this.petales = [];
			for (let i=0; i<this.nbPetales; i++) {
				let monPetale = new Petale(this, i);
				this.petales.push(monPetale);
			}

			this.bouge();	
		}
		bouge() {
			this.dessine()
			this.delai = Math.floor(Math.random()*500 + 2000/force);
			let t = setTimeout(this.bouge.bind(this), this.delai);
		}
		dessine() {
			this.n2 = PM(rnd(5)) + this.sens*rnd(force*5);
			var pathD = "M 0,0 Q " + this.n2 +"," + this.sens*(50+zPM(rnd(15))) + " " + this.n1*2 + "," + this.sens*(100+zPM(rnd(20)));
			this.fleur.setAttribute("d",pathD);
			switch (etat) {
				case ("en_fleur") :
					for (let i=0; i<this.nbPetales; i++) {
						if (this.petales[i].surFleur) {
							let petale = this.petales[i].petale;
							petale.style.offsetPath = "path('" + pathD + "')";
							petale.style.transitionDuration = this.delai + "ms";
						}
					}
					break;
				case ("en_feuilles") :
					for (let i=0; i< 11; i++) {
						let feuille = this.feuilles[i].feuille;
						feuille.style.offsetPath = "path('" + pathD + "')";
						feuille.style.transitionDuration = this.delai + "ms";
						feuille.style.display = "block";
					}
					break;
			} 
			this.fleur.style.transitionDuration = this.delai + "ms";
			this.n1 = this.n2;
		}
		enFeuille() {
			this.feuilles = [];
			this.feuillesPos = [20, 20, 36, 36, 52, 52, 68, 68, 84, 84, 100];
			this.feuillesScale = [.5, .5, .6, .6, .75, .75, .9, .9, .95, .95, 1];
			this.feuillesAngle = [90, 270, 80, 280, 70, 290, 55, 305, 40, 320, 0];
			for (let i=0; i<11; i++) {
				let maFeuille = new Feuille(this, i);
				this.feuilles.push(maFeuille);
			}
		}

	}

	class Petale {
		constructor(fleur, id) {
			this.fleur = fleur;
			this.tige = this.fleur.tige;
			this.id = id;
			this.pos = 10 + Math.floor((100-10)*id/this.fleur.nbPetales);
			this.angle = 45 * this.id;
			this.scale0 = 1.4-this.id*0.02;
			let modele = document.getElementById("petaleCache");
			this.petale = modele.cloneNode(true);
			let img = this.petale.getElementsByTagName("img")[0];
			img.src = "images/petale_"+Math.floor(Math.random()*4)+".png";
			this.petale.setAttribute("id","petale_"+this.tige.id+"_"+this.fleur.id+"_"+this.id);
			this.petale.style.offsetDistance = this.pos + "%";
			this.fleur.corole.appendChild(this.petale);
			this.surFleur = true;
			this.dessine();
		}
		dessine() {
			var dScale = zPM(this.scale0/100);
			this.scale = this.scale0 + dScale;
			this.petale.style.transform = mat3dToCSS(prod2mat3d(matRotate3d(0, 0, this.angle), matScale3d(this.scale, this.scale)));
		}
		tombe() {
			this.surFleur = false;
			this.sens = PM();
			//	recuperation des coordonnees absolues
			this.origX = this.petale.getBoundingClientRect().x;
			this.origY = this.petale.getBoundingClientRect().y;
			//	changement de container
			this.fleur.corole.removeChild(this.petale);
			document.getElementById("sol").appendChild(this.petale);
			//	reset du style
			this.petale.setAttribute("style", "");
			this.petale.classList.toggle("envol");
			//	parametrage initial de l'envol
			this.petale.style.zIndex = Zindex--;
			this.cibleX = rnd(W);
			this.cibleY = rnd(H);
			this.angleX = this.angleY = 0;
			this.angleZ = this.angle;
			this.x = this.origX;
			this.y = this.origY;
			this.gereVol();
		}
		gereVol() {
			this.angleX += zPM(rnd(60));
			this.angleY += zPM(rnd(60));
			this.angleZ += this.sens * rnd(40);
			this.scale *= 1.02;
			this.x += (this.cibleX - this.x)/20 + zPM(rnd(30));
			this.y += (this.cibleY - this.y)/20 + zPM(rnd(30));
			if (this.scale < 2) {
				this.petale.style.transform = mat3dToCSS(prod2mat3d(matTranslate3d(this.x,this.y,0),prod2mat3d(matRotate3d(this.angleX, this.angleY, this.angleZ), matScale3d(this.scale, this.scale))));
				let t = setTimeout(this.gereVol.bind(this), 40);
			}
			else {
				//	aterrissage
				this.petale.style.transform = mat3dToCSS(prod2mat3d(matTranslate3d(this.x,this.y,0),prod2mat3d(matRotate3d(0, 0, this.angle), matScale3d(this.scale, this.scale))));
				this.petale.style.filter = "brightness(80%)";
				this.petale.classList.toggle("ausol");
			}
		}
	}

	class Feuille {
		constructor(fleur, id) {
			this.id = id;
			this.fleur = fleur;
			this.tige = this.fleur.tige;
			this.pos = this.fleur.feuillesPos[this.id];
			this.angle = this.fleur.feuillesAngle[this.id];
			this.scale = this.fleur.feuillesScale[this.id];
			let modele = document.getElementById("feuilleCache");
			this.feuille = modele.cloneNode(true);
			this.feuille.setAttribute("id","feuille_"+this.tige.id+"_"+this.fleur.id+"_"+this.id);
			this.feuille.style.offsetDistance = this.pos + "%";
			this.feuille.style.display = "none";
			this.fleur.corole.appendChild(this.feuille);
			this.bouge();
		}
		bouge() {
			this.dessine()
			this.delai = Math.floor(Math.random()*500 + 2000/force);
			let t = setTimeout(this.bouge.bind(this), this.delai);
		}
		dessine() {
			let angX = rnd(30);
			let angY = rnd(50);
			this.feuille.style.transform = mat3dToCSS(prod2mat3d(matRotate3d(angX, angY, this.angle), matScale3d(this.scale, this.scale)));
		}
	}
	function faitTomber() {
		if (etat == "fini") location.reload();
		lotChute += 5;
		var l = 0;
		var tot = 0;
		for (let i=0; i<nbTiges; i++) {
			let fleurs = tiges[i].fleurs;
			for (let j=0; j<fleurs.length; j++) {
				let petales = fleurs[j].petales;
				for(let k=0; k<petales.length; k++) {
					if (petales[k].surFleur === true) tot ++;
				}
			}
		}
		if (tot<1) {
			enFeuille();
			let t = setTimeout(balaye, 1500);
			return;
		}
		while( l < Math.min(lotChute, tot) ) {
			let laTige = tiges[rnd(nbTiges)];
			let laFleur = laTige.fleurs[rnd(laTige.nbFleurs)];
			let lePetale = laFleur.petales[rnd(laFleur.nbPetales)];
			while (lePetale.surFleur === false) {
				laTige = tiges[rnd(nbTiges)];
				laFleur = laTige.fleurs[rnd(laTige.nbFleurs)];
				lePetale = laFleur.petales[rnd(laFleur.nbPetales)];
			}
			lePetale.tombe();
			l++;
		}
		let t = setTimeout(faitTomber, 1000);
	}
	function balaye() {
		let sol = document.getElementById("sol");
		sol.style.animation = "balai 2s ease-in";
		let t = setTimeout(function() { etat = "fini"; sol.style.display = "none"; }, 1800);
	}
	function enFeuille() {
		for (let i=0; i<nbTiges; i++) {
			tiges[i].enFeuille();
		}
		etat = "en_feuilles";
	}
//------------------ fonctions utilitaires


	function debug(fleur) {
		var out = "";
		out += "scaleX= "+ fleur.scaleX+"<br/>";
		out += "scaleY= "+ fleur.scaleY+"<br/>";
		out += "angleX= "+ fleur.angleX+"<br/>";
		out += "angleY= "+ fleur.angleY+"<br/>";
		out += "angleZ= "+ fleur.angleZ+"<br/>";
		document.getElementById("debug").innerHTML = out;
	}


	function zPM(x = 1) {		
	    return x * (Math.floor(Math.random()*3) - 1);	
	}
	function PM(x = 1) {
	    return x * ((((Math.floor(Math.random()*2)) * 4) - 2) / 2);
	}
	function rnd(x = 1) {
		return Math.floor(Math.random()*x);
	}
	function matRotate(deg) {
		var rad = Math.PI * deg / 180; 		// conversion deg -> rad
		return [Math.cos(rad), Math.sin(rad), -Math.sin(rad), Math.cos(rad), 0, 0];
	}
	function matScale(x, y) {
		return [x, 0, 0, y, 0 , 0];
	}
	function matSkew(x, y) {		// x et y -1< >1
		return [0, y, x , 0, 0, 0];
	}
	function prod2mat(A, B) {
		return [A[0]*B[0] + A[2]*B[1],
				A[1]*B[0] + A[3]*B[1],
				A[0]*B[2] + A[2]*B[3],
				A[1]*B[2] + A[3]*B[3],
				A[0]*B[4] + A[2]*B[5] + A[4],
				A[1]*B[4] + A[3]*B[5] + B[5]];
	}
	function matToCSS(M) {
		return "matrix("+M[0]+", "+M[1]+", "+M[2]+", "+M[3]+", "+M[4]+", "+M[5]+")";
	}
	function matScale3d(x, y) {				// rapports en x et y
		return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
	}
	function matTranslate3d(x, y, z) {		// distances en pixels
		return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];
	}
	function matSkew3d(x, y) {				// !! 	-0,01 < x et y < +0,01
		return [1, 0, 0, y, 0, 1, 0, x, 0, 0, 1, 0, 0, 0, 0, 1];
	}
	function matRotate3d(x, y, z) {			// angles en degr�s
		return [cos(y)*cos(z), -sin(z), sin(y), 0, sin(z), cos(x)*cos(z), sin(x), 0, -sin(y), -sin(x), cos(x)*cos(y), 0, 0, 0, 0, 1];
	}
	function cos(a) {						// convertit en radians et retourne le cosinus
		return Math.cos(Math.PI*a/180);
	}
	function sin(a) {						// convertit en radians et retourne le sinus
		return Math.sin(Math.PI*a/180);
	}
	function prod2mat3d(A, B) {				// produit de 2 matrices
		return [LigneAcolonneB(A, 0, B, 0),
				LigneAcolonneB(A, 1, B, 0),
				LigneAcolonneB(A, 2, B, 0),
				LigneAcolonneB(A, 3, B, 0),
				LigneAcolonneB(A, 0, B, 4),
				LigneAcolonneB(A, 1, B, 4),
				LigneAcolonneB(A, 2, B, 4),
				LigneAcolonneB(A, 3, B, 4),
				LigneAcolonneB(A, 0, B, 8),
				LigneAcolonneB(A, 1, B, 8),
				LigneAcolonneB(A, 2, B, 8),
				LigneAcolonneB(A, 3, B, 8),
				LigneAcolonneB(A, 0, B, 12),
				LigneAcolonneB(A, 1, B, 12),
				LigneAcolonneB(A, 2, B, 12),
				LigneAcolonneB(A, 3, B, 12)];
	}
	function prodMat3dPoint(A, a, b) {		// application d'une mat 3d a un point (x, y); retourne un nouveau point
		return {x:A[0]*a + A[4]*b, y:A[1]*a + A[5]*b};
	}
	function LigneAcolonneB(A, i, B, j) {	// calcul d'un element produit
		return A[i]*B[j] + A[i+4]*B[j+1] + A[i+8]*B[j+2] + A[i+12]*B[j+3];
	}
	function mat3dToCSS(M) {
		return "matrix3D("+M[0]+","+M[1]+","+M[2]+","+M[3]+","+M[4]+","+M[5]+","+M[6]+","+M[7]+","+M[8]+","+M[9]+","+M[10]+","+M[11]+","+M[12]+","+M[13]+","+M[14]+","+M[15]+")";
	}
	
	
//--------------------------------------------- O L D ------------------------------

