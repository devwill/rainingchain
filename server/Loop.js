Loop = function(){
	try {
	Loop.frame++;	
    Test.loop();
    Performance.loop();
	
	Loop.bullet();
	Loop.strike();
	Loop.group();
	Loop.actor();
	Loop.drop();
	Loop.map();
	Loop.team();
	
	Change.update();
	Change.send();
	
	Loop.logOut();
	} catch(err){ ERROR.err(err); }
}
Loop.frame = 0; 

Loop.interval = function(num){
	return Loop.frame % num === 0;
}

Loop.actor = function(){
	for (var i in List.actor ){     
	    Actor.loop(List.actor[i]); 
	}
}

Loop.bullet = function (){
	for(var i in List.bullet){
		Bullet.loop(List.bullet[i]);
	}
	if(Loop.interval(25)){
		Bullet.loop.mapMod();	
	}
}

Loop.strike = function(){
	for(var i in List.strike){
		Strike.loop(List.strike[i]); 
	}
}

Loop.drop = function(){
	for(var i in List.drop){ 
		var drop = List.drop[i];
		if(--drop.timer <= 0){ Drop.remove(drop); }
	}
}

Loop.map = function(){
	for(var i in List.map){
		Map.loop(List.map[i]);		
	}
}

Loop.group = function(){
	for(var i in List.group){
		var g = List.group[i];
		var list = g.list;
		var alldead = true;
		
		for(var j in list){
			var e = List.actor[j];
			if(!e){ delete list[j]; ERROR(2,'no actor');  continue; }
			if(!e.dead){ alldead = false; }
			if(e.dead && e.deleteOnceDead){
				Actor.remove(e);
				delete list[j];
				continue;
			}
		}
		if(Object.keys(g.list).length === 0){ delete List.group[i]; continue; } //get removed if no longer in List or deleteOnceDead
		
		if(alldead){ //aka all dead
			if(--g.respawn <= 0){
				Actor.creation.group.apply(this,g.param); 
				for(var j in list) Actor.remove(List.actor[j]);				
				delete List.group[i];
				continue;
			}
		}	
	}
}

Loop.logOut = function(){
	//Check inactivity of players 
	for(var i in List.socket){
		var socket = List.socket[i];
		socket.timer += 40;		//gets reset when input
		socket.globalTimer += 40;		
		if((socket.timer >= Server.frequence.inactivity || socket.globalTimer >= Server.frequence.disconnect || socket.toRemove) && !socket.beingRemoved){
			Sign.off(i,'Disconnected due to inactivity.');
		}
		if(socket.removed)	Sign.off.remove(i);
	}
	for(var i in List.main){
		if(!List.socket[i]){
			ERROR(2,'socket disconnect but main not removed');
			Sign.off.remove.safe(i);
		}
	}
}


Loop.team = function(){
	if(!Loop.interval(50)) return;
	List.team = {};
	for(var i in List.main){
		var team = List.actor[i].team;
		List.team[team] = List.team[team] || {};
		List.team[team][i] = i;
	}

}

Activelist = {};	//Actor.loop.activeList is where the update happens
Activelist.test = function(act,obj){	
	//Test used to know if obj should be in activeList of act.
	if(!obj){ return false; }
	if(act.id === obj.id){ return false; }
	if(!obj.viewedIf){ return false; }
	if(obj.viewedIf === 'false'){ return false; }
	if(act.map !== obj.map){ return false; }
	if(obj.dead){ return false; }
	if(typeof obj.viewedIf === 'function' && !obj.viewedIf(act.id,obj.id)){ return false; }
	if(typeof obj.viewedIf === 'object' && obj.viewedIf.indexOf(act.id) === -1){ return false; }
	
	var rect = [act.x-800,act.x+800,act.y-600,act.y+600];
	
	return Collision.PtRect(obj,rect);
}

Activelist.add = function(b){		//set the viewedBy of b AND add b to activeList of surrounding actors
	for(var i in List.map[b.map].list.actor){
		var player = List.actor[i];
		if(!player){ ERROR(2,'player dont exist'); continue; }
		
		if(Activelist.test(player,b)){ 
			player.activeList[b.id] = b.id;
			if(player.type !== 'player' || b.type === 'strike'){ 
				b.viewedBy[player.id] = 1; 
			}
		}
	}
}

Activelist.remove = function(b){
	if(!b){ ERROR(2,'actor dont exist'); return; }
	for(var i in b.viewedBy){
		if(!List.all[i]){ ERROR(2,'actor dont exist'); continue; }
		if(List.all[i].removeList) List.all[i].removeList.push(b.publicId || b.id);
        delete List.all[i].activeList[b.id];
	}
}

removeAny = function(act){
	if(typeof act === 'string') act = List.all[act];
	if(!act) { ERROR(2,'actor dont exist'); return; }
	if(act.type === 'bullet') Bullet.remove(act);
	else if(act.type === 'npc') Actor.remove(act);
	else if(act.type === 'player') Sign.off(act.id);
	else if(act.type === 'drop') Drop.remove(act);
	else if(act.type === 'strike') Strike.remove(act);
}




