var db = openDatabase("appSuper", "0.1", "appSuper", 50 * 1024 * 1024);
//$(document).ready(crearTablaConfiguraciones);

function crearTablaConfiguraciones(){	
	db.transaction(function(tx){
		//crea la tabla de configuraciones
		tx.executeSql(
			'create table if not exists configuraciones (variable primary key,valor,tipo)',
			[],
			function(tx,result){
				
			},
			function(tx,error){
				$.ui.popup('Error al crear la tabla de configuraciones');
			}
		);
		//inserta las variables de configuración
		var variables=
		{
			0:
			[
				{0:'confSrv',1:'string'},
				{0:'confInstancia',1:'string'},
				{0:'confDb',1:'string'},
				{0:'confUsr',1:'string'},
				{0:'confPsw',1:'string'}
			]
		};
		//alert(variables[0][1][0]);
		for(var i=0;i<variables[0].length;i++){
			//alert('insert into configuraciones (variable,valor,tipo) values ("'+variables[0][i][0]+'","","'+variables[0][i][1]+'")');
			tx.executeSql(
				'insert into configuraciones (variable,valor,tipo) values ("'+variables[0][i][0]+'","","'+variables[0][i][1]+'")',
				[],
				function(tx,result){
					
				},
				function(tx,error){
					//alert(error.message);
				}
			);
		}
		setConfiguraciones();
	});
}

function setConfiguraciones(){
	db.transaction(function(tx){
		tx.executeSql(
			'select * from configuraciones',
			[],
			function(tx,result){
				if(result.rows.length>0){
					for(var i=0;i<result.rows.length;i++){
						if(result.rows.item(i).tipo=='string'){
							$('#'+result.rows.item(i).variable).val(result.rows.item(i).valor);
						}
						if(result.rows.item(i).tipo=='bool'){
							$('#'+result.rows.item(i).variable).is(':checked',result.rows.item(i).valor);
						}
					}
				}
				else{
					$.ui.popup('No se encontraron registros en la tabla de configuraciones');
				}
			},
			function(tx,error){
				
			}
		);
	});
}

function guardarConfiguraciones(){
	db.transaction(function(tx){
		$('.confString').each(
			function(){
				var variable=$(this).attr('id');
				var valor=$('#'+$(this).attr('id')).val();
				var query ='update configuraciones set valor="'+valor+'" where variable="'+variable+'"';
				//alert(query);
				tx.executeSql(
					query,
					[],
					function(tx,result){
						
					},
					function(tx,error){
						
					}
				);
			}
		);
	});
}

function logIn(){
	$.ajax({
		url: 'http://'+$('#confSrv').val()+'/appSuper/logIn.asp',
		dataType: 'GET',
		data: {
			confInstancia:$('#confInstancia').val(),
			confDb:$('#confDb').val(),
			confUsr:$('#confUsr').val(),
			confPsw:$('#confPsw').val(),
			usr:$('#usrLogIn').val(),
			psw:$('#pswLogIn').val()
		},
		cache: false,
		timeout: 10000,
		success: function(res) {
			if(res!==''){
				var datosUsuario=res.split('|');
				$('#usrCodigo').val(datosUsuario[0]);
				$('#usrNombre').text(datosUsuario[1]);
				$.ui.loadContent("#principal",false,true,"slide");
			}
			else{
				//alert(res);
				$.ui.popup('Usuario o Contraseña incorrectos.');
			}
		}
	});
}

function buscarCodigo(x){
    $.ajax({
		url: 'http://'+$('#confSrv').val()+'/appSuper/consultaArticulo.asp',
		dataType: 'GET',
		data: {
			confInstancia:$('#confInstancia').val(),
			confDb:$('#confDb').val(),
			confUsr:$('#confUsr').val(),
			confPsw:$('#confPsw').val(),
			codigo:x
		},
		cache: false,
		timeout: 10000,
		success: function(res) {
			if(res!==''){
                //alert(res);
				var datosArticulo=res.split('|');
				$.ui.popup( {
                   title:"Artículo",
                   message:"Nombre: "+datosArticulo[1]+"<br>Precio: <strong>$"+datosArticulo[2]+"</strong><br>Código: <r id='resCodigoArticulo'>"+datosArticulo[0]+"</r><br><input type='number' id='cantArticulos' placeholder='Cantidad' value='1' />",
                   cancelText:"Cancelar",
                   cancelCallback: function(){console.log("cancelled");},
                   doneText:"Imprimir",
                   doneCallback: function(){
                       var usuarioKey=$('#usrCodigo').val();
                       var articuloKey=$('#resCodigoArticulo').text();
                       var cantArticulos=$('#cantArticulos').val();
                       $.ajax({
                            url: 'http://'+$('#confSrv').val()+'/appSuper/insertArticulo.asp',
                            dataType: 'GET',
                            data: {
                                confInstancia:$('#confInstancia').val(),
                                confDb:$('#confDb').val(),
                                confUsr:$('#confUsr').val(),
                                confPsw:$('#confPsw').val(),
                                usuarioKey:usuarioKey,
                                articuloKey:articuloKey,
                                cantidad:cantArticulos
                            },
                            cache: false,
                            timeout: 10000,
                            success: function(res) {
                                if(res===''){
                                    /*var datosUsuario=res.split('|');
                                    $('#usrCodigo').val(datosUsuario[0]);
                                    $('#usrNombre').text(datosUsuario[1]);
                                    $.ui.loadContent("#principal",false,true,"slide");*/
                                    $('#codigoManual').val('');
                                }
                                else{
                                    $.ui.popup( {
                                       title:"Atención",
                                       message:"Ocurrió un problema durante el envío de datos, intente nuevamente.",
                                       cancelText:"Aceptar",
                                       cancelCallback: function(){console.log("cancelled");},
                                       doneText:"Aceptar",
                                       doneCallback: function(){console.log("Done for!");},
                                       cancelOnly:true
                                     });
                                }
                            }
                        });
                   },
                   cancelOnly:false
                 });
			}
			else{
				//alert(res);
                $.ui.popup( {
                   title:"Atención",
                   message:"No se encontró el Artículo",
                   cancelText:"Aceptar",
                   cancelCallback: function(){console.log("cancelled");},
                   doneText:"Aceptar",
                   doneCallback: function(){console.log("Done for!");},
                   cancelOnly:true
                 });
				//$.ui.popup('No se encontró el artículo');
			}
		}
	});
}