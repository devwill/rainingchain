//LICENSED CODE BY SAMUEL MAGNAN FOR RAININGCHAIN.COM, LICENSE INFORMATION AT GITHUB.COM/RAININGCHAIN/RAININGCHAIN
eval(loadDependency(['ActiveList','Sprite'],['SpriteModel']));
if(SERVER) eval('var SpriteModel');

(function(){ //}
var SIGN_IN_PACK = {};

SpriteModel = exports.SpriteModel = function(id,src,bumperBox,extra,anim){
	bumperBox = SpriteModel.bumperBox.apply(this,bumperBox);
	SIGN_IN_PACK[id] = [id,src,bumperBox,extra,anim];	//data sent to client
	var a = {
		id:'',
		src:"actor/main.png",
		img:null,	//client only
		filteredImg:{},	//client only
		size:1,
		side:[0,1,2,3],
		hpBar:0,
		legs:0,
		bumperBox:bumperBox,
		hitBox:SpriteModel.hitBox(-10,10,-10,10),
		anim:{},
		defaultAnim:"walk",
		alpha:1,
		canvasRotate:0,
		mirror:0,			//UNUSED: if 90 < angle < 270, symetry
		offsetY:0,
		offsetX:0,
		showBorder:true,
	};
	
	a.id = id;
	a.src = 'img/sprite/' + src;
	if(!extra.hitBox) extra.hitBox = Tk.deepClone(bumperBox);
	for(var i in extra) a[i] = extra[i];
	
	for(var i in anim){
		a.anim[anim[i].name] = anim[i];
		a.anim['walk'] = anim[i];	//BAD temp
		a.anim['attack'] = anim[i];
		a.anim['travel'] = anim[i];
		a.anim['move'] = anim[i];
		break;	
	}
		
	DB[id] = a;
	return id;
}
var DB = SpriteModel.DB = {};

SpriteModel.get = function(id){
	return DB[id] || null;
}

SpriteModel.useSignInPack = function(pack){	//client side only, for now
	for(var i in pack)
		SpriteModel.apply(this,pack[i]);
}

SpriteModel.hitBox = SpriteModel.bumperBox = function(minX,maxX,minY,maxY){
	if(Array.isArray(minX)){ maxX = minX[1]; minY = minX[2]; maxY = minX[3]; minX = minX[0]; }
	return {
		right:{ "x":maxX,"y":(minY+maxY)/2 },
		down:{ "x":(minX+maxX)/2,"y":maxY },
		left:{ "x":minX,"y":(minY+maxY)/2 },
		up:{ "x":(minX+maxX)/2,"y":minY }
	};
}


SpriteModel.bullet = function(id,src,sizeX,sizeY,frame,canvasRotate,extra){
	extra = extra || {};
	extra.side = extra.side || [0];
	extra.showBorder = false;
	extra.canvasRotate = canvasRotate || 0;
	return SpriteModel(id,src,[-1,1,-1,1],extra,[
		SpriteModel.anim('move',frame,sizeX,sizeY,1,{walk:0,dir:extra.side.length})
	]);
}
SpriteModel.player = function(id,src){
	var extra = {player:1,size:2.7,side:[1,2,3,0],hpBar:-17,legs:20,hitBox:[ -12,12,-12,12]}
	return SpriteModel(id,src,[-12,12,-5,20],extra,[
		SpriteModel.anim("move",4,24,32,0.5)
	]);
}
SpriteModel.picture = function(id,src,sizeX,sizeY,size,extra){
	extra = extra || {};
	extra.side = extra.side || [0];
	extra.size = size || 1;
	return SpriteModel(id,src,[-sizeX/2+1,sizeX/2-1,-sizeY/2+1,sizeY/2-1],extra,[
		SpriteModel.anim('move',1,sizeX,sizeY,0,{dir:extra.side.length})
	]);
}
SpriteModel.rpgvx = function(id,src){
	var extra = {size:2,side:[2,0,1,3],hpBar:-22,legs:16};
	return SpriteModel(id,src,[-16,16,-16,16 ],extra,[
		SpriteModel.anim('move',3,32,32,0.5)
	]);
}
SpriteModel.anim = function(name,frame,sizeX,sizeY,spd,extra){	//part of model
	var a = {
		name:'walk',
		startY:0,
		frame:4,
		sizeX:24,
		sizeY:32,
		dir:4,
		spd:0.4,
		walk:1,
		next:'walk'
	};
	a.name = name;
	a.frame = frame || a.frame;
	a.sizeX = sizeX || a.sizeX;
	a.sizeY = sizeY || a.sizeY;
	a.spd = Tk.nu(spd,a.spd);
	extra = extra || {};
	for(var i in extra) a[i] = extra[i];
	return a;
}


SpriteModel.getSignInPack = function(){
	return SIGN_IN_PACK;
}





if(SERVER) return;
var SpriteFilter = function(id,func,advanced){
	SpriteFilter.LIST[id] = {
		func:func,
		advanced:advanced || false,
	}
}
SpriteFilter.LIST = {};

SpriteFilter('red',function(){
	this.contrast(5).render();
});

SpriteFilter('green',function(){
	this.contrast(5).render();
});

SpriteFilter('blue',function(){
	this.contrast(5).render();
});

SpriteFilter('allBlack',function(){
	this.contrast(5).render();
},true);


SpriteFilter('dodge',function(){
	this.contrast(5).render();
});



//TEST(SpriteModel.DB['warrior-male0']);
SpriteModel.generateSpriteFilteredImg = function(spriteModel,filter){
	var canvas = $('<canvas>')[0];/*
		.attr({
			width:spriteModel.img.width,
			height:spriteModel.img.height
		})[0];*/
	
	
	if(filter === 'allBlack'){	//need optimization cuz called often
		$(canvas).attr({
			width:spriteModel.img.width,
			height:spriteModel.img.height
		});
		
		var ctx = canvas.getContext("2d");
		ctx.drawImage(spriteModel.img,0,0);
		SpriteModel.generateSpriteFilteredImg.allBlack(spriteModel.img,ctx);
		spriteModel.filteredImg[filter] = new Image();
		spriteModel.filteredImg[filter].src = canvas.toDataURL();
		return;
	}
	
	spriteModel.filteredImg[filter] = new Image();
	
	Caman(canvas,spriteModel.img.src,function(){
		this.resize({
			width: spriteModel.img.width,
			height: spriteModel.img.height
		 });
		this.contrast(10);
		this.render();
		SpriteFilter.LIST[filter].func.apply(this,[]);
		spriteModel.filteredImg[filter] = new Image();
		spriteModel.filteredImg[filter].src = canvas.toDataURL();
	});	
}
/*
CANVAS = null;
CAMAN = null;
CTX = null;
IMG = null;
TEST = function(){
	var spriteModel = SpriteModel.get(player.sprite.name);
	var canvas = CANVAS = $('<canvas>')
		.attr({
			width:spriteModel.img.width,
			height:spriteModel.img.height
		})[0];
	var ctx = CTX = canvas.getContext("2d");
	
	IMG = spriteModel.img;
	
	$('body').append(canvas);
	ctx.drawImage(spriteModel.img,0,0);
	
	
	CAMAN = Caman(canvas,spriteModel.img.src,function(){
		//this.canvas.getContext('2d').drawImage(spriteModel.img,0,0);
		//this.contrast(5).render();
		//SpriteFilter.LIST[filter].func.apply(this,[]);
		//spriteModel.filteredImg[filter] = new Image();
		//spriteModel.filteredImg[filter].src = canvas.toDataURL();
	});	
}
*/

SpriteModel.generateSpriteFilteredImg.allBlack = function(img,ctx){
	ctx.globalCompositeOperation = 'source-atop';
	ctx.fillStyle = 'black';
	ctx.fillRect(0,0,10000,10000);
}

SpriteModel.get2DArray = function(imgData,height,width){	//no clue if works...
	var tmp = [];
	for (var j = 0; j < height; j++){
		tmp.push([]);
		for (var i = 0; i < width; i++){
			tmp[j][i] = {
				red:imgData[j*width*4+i*4],
				green:imgData[j*width*4+i*4+1],
				blue:imgData[j*width*4+i*4+2],
				alpha:imgData[j*width*4+i*4+3]
			}
		}
	}
	return tmp;
}

SpriteModel.getImage = function(model,spriteFilter){	//BAD with act... HARDCODED for border
	if(!spriteFilter){
		if(model.img && model.img.complete) 
			return model.img;	//idk if complete is good...
		else {
			model.img = new Image();
			model.img.src = model.src;
			return;
		}
	}
	
	var filterId = spriteFilter.filter;
	if(model.filteredImg[filterId] && model.filteredImg[filterId].complete)
		return model.filteredImg[filterId];
	else {
		SpriteModel.generateSpriteFilteredImg(model,filterId);
		return SpriteModel.getImage(model,null);	//return normal version
	}
	
	
	
}








})();

