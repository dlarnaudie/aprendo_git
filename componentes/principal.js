Vue.component('dl_principal',{
  data: function () {
    return {

    }
},	
template: /*html*/`
<div> 
<!--11111111111111111111111111111111111111111111111111111111111111 -->

          <div class="box p-1 m-1">
                <div class="columns is-desktop p-1 m-1">
                    <div class="column content is-half-desktop p-1 m-1" is-12>
                      <h4>Ingresar el significado de la palabra: </h4><h2 class="is-large">{{$store.state.palabra}}</h2>
                    </div>
                    <div class="column is-half-desktop p-1 m-1" is-12>
                      <b-input placeholder="Significado:"  v-model="$store.state.significado_ingresado" maxlength="350"></b-input>
                    </div>
                </div>
                <div class="columns is-desktop p-1 m-1">
                  <div class="column is-half-desktop p-1 m-1" is-12>
                  <b-button class="p-1 m-1" expanded @click="Compruebo()" type="is-success"  icon-left="head-check"  > Comprobar </b-button>
                  </div>
                  <div class="column is-half-desktop p-1 m-1" is-12>
                    <h1>Explicación: {{$store.state.explicacion}} </h1>
                  </div>
                  <div class="column is-half-desktop p-1 m-1" is-12>
                    <h1>Cantidad de aciertos: {{$store.state.aciertos}}</h1>
                  </div>
                </div>
          </div>
        <b-button class="p-3 m-2" size="is-medium" @click="$store.state.modal_visible = 'modal_agrego_registro'" type="is-danger"  icon-left="playlist-plus"> Nuevo </b-button>




<b-modal :active.sync="$store.state.modal_visible == 'modal_agrego_registro'"
        full-screen
        has-modal-card
        trap-focus
        :destroy-on-hide="false"
        aria-role="dialog"
        aria-modal>

        <div class="box p-1 m-1 modal-card" style="width: auto">
              <div class="columns is-desktop p-1 m-1">
                  <b-field class="column is-one-third-desktop p-1 m-1" is-12 label="Palabra en idioma original">
                    <b-input placeholder="Palabra original;"  v-model="$store.state.nueva_palabra" maxlength="350"></b-input>
                  </b-field>

                  <b-field class="column is-one-third-desktop p-1 m-1" is-12 label="Palabra traducida">
                    <b-input placeholder="Palabra traducida;"  v-model="$store.state.nueva_palabra_traducida" maxlength="350"></b-input>
                  </b-field>

                  <b-field class="column is-one-third-desktop p-1 m-1" is-12 label="Explicación de significado">
                    <b-input placeholder="Explicación;"  v-model="$store.state.nueva_explicacion" maxlength="350"></b-input>
                  </b-field>
            </div>
            <div class="columns is-desktop p-1 m-1">
                  <div class="column is-half-desktop p-1 m-1" is-12>
                  <b-button class="p-1 m-1" expanded @click="Agrego_registro()" type="is-success"  icon-left="playlist-plus"  >Agregar</b-button>
                  </div>
                  <div class="column is-half-desktop p-1 m-1" is-12>
                  <b-button class="p-1 m-1" expanded @click="$store.state.modal_visible = ''" type="is-danger"  icon-left="backburger"  > Volver </b-button>
                  </div>
              </div>
        </div>
</b-modal>





</div>
`,

computed:{
      },
watch:{
      },
methods:
    {    
      Compruebo: function(){
                var hay_acierto = false;
                var esta = this;
                app.chequeo_conexion();
                if (store.state.hayconexion == true) {// si hay conexion........................................................................
                  for(var i = 0; i < store.state.datos_ingles.length; i++)
                  {
                    if (store.state.datos_ingles[i].palabra.toUpperCase() == store.state.palabra.toUpperCase() && store.state.datos_ingles[i].significado.toUpperCase() == store.state.significado_ingresado.toUpperCase())
                    {
                          hay_acierto = true;
                    }
                  } 
                }
                else
                {
                  this.$buefy.toast.open('No hay conexion!!!!');
                }

                if (hay_acierto == true)  
                      {
                      var fd = new FormData();
                      let sql =  "UPDATE dl_ingles SET aciertos = aciertos + 1 WHERE palabra = '" + store.state.palabra + "'";
                      fd.append("sql",sql);
                      fd.append("tipo", 'update');
                          var getUrl = window.location;
                          var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                          var phpfile = baseUrl + '/php/consultas_db.php';
                          var xhr = new XMLHttpRequest();	
                          xhr.open('POST',phpfile,true);
                          xhr.onload = function() {
                            esta.$buefy.toast.open('Acierto!!!! Datos actualizados');
                          };
                          xhr.send(fd);
                        }
                        else
                        {
                          let mensaje = "No hay acierto!!!! Era: " + store.state.significado + ". Registro siguiente";
                          this.$buefy.toast.open(mensaje);
                        }
                        if (store.state.registro < store.state.datos_ingles.length)
                        { store.state.registro = store.state.registro + 1;}
                        else
                        {store.state.registro = 0;}
                        store.state.palabra = store.state.datos_ingles[store.state.registro].palabra;
                        store.state.significado = store.state.datos_ingles[store.state.registro].significado;
                        store.state.explicacion = store.state.datos_ingles[store.state.registro].explicacion;
                        store.state.aciertos = store.state.datos_ingles[store.state.registro].aciertos;
                        store.state.significado_ingresado = '';
             
      },
      Agrego_registro: function(){
        var esta = this;
        app.chequeo_conexion();
        if (store.state.hayconexion == true) {// si hay conexion........................................................................
              var fd = new FormData();
              let sql =  "INSERT INTO dl_ingles (palabra, significado, explicacion, aciertos) VALUES ('";
              sql = sql + store.state.nueva_palabra + "','" + store.state.nueva_palabra_traducida + "','" + store.state.nueva_explicacion + "',0)";
              fd.append("sql",sql);
              fd.append("tipo", 'nuevo_registro');
                  var getUrl = window.location;
                  var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                  var phpfile = baseUrl + '/php/consultas_db.php';
                  var xhr = new XMLHttpRequest();	
                  xhr.open('POST',phpfile,true);
                  xhr.onload = function() {
                    store.state.datos_ingles = JSON.parse(this.response);
                    esta.$buefy.toast.open('Nuevo registro agregado!!!!');
                  };
                  xhr.send(fd);    
          }  
      }    
      },
mounted: function () {
       var fd = new FormData();
      let sql =  "SELECT palabra, significado, explicacion, aciertos FROM dl_ingles WHERE aciertos < 20";
      fd.append("sql",sql);
      fd.append("tipo", 'select');
          var getUrl = window.location;
          var baseUrl = getUrl .protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
          var phpfile = baseUrl + '/php/consultas_db.php';
          var xhr = new XMLHttpRequest();	
          xhr.open('POST',phpfile,true);
          xhr.onload = function() {
            store.state.datos_ingles = JSON.parse(this.response);
            store.state.palabra = store.state.datos_ingles[0].palabra;
            store.state.significado = store.state.datos_ingles[0].significado;
            store.state.explicacion = store.state.datos_ingles[0].explicacion;
            store.state.aciertos = store.state.datos_ingles[0].aciertos;
          }
          xhr.send(fd);

        }

})

    
 

 