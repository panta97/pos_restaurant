# Configure windows task scheduler

1. Open exe with `W-key` + `R`
2. Run _taskschd.msc_
3. Accion -> Crear tarea basica

---

### 1 Crear tarea

![1_createtask](https://github.com/panta97/pos_restaurant/blob/master/server/docs/md-assets/1_createtask.png?raw=true)

### 2 Trigger

![2_trigger](https://github.com/panta97/pos_restaurant/blob/master/server/docs/md-assets/2_trigger.png?raw=true)

### 3 Script

![3_script](https://github.com/panta97/pos_restaurant/blob/master/server/docs/md-assets/3_script.png?raw=true)

**Programa o Script** "C:\Program Files\nodejs\node.exe"

**Agregar argumentos** index.js

**Iniciar en** D:\POS_SERVER

### Finish

![4_finish](https://github.com/panta97/pos_restaurant/blob/master/server/docs/md-assets/4_finish.png?raw=true)

### Props

![5_props](https://github.com/panta97/pos_restaurant/blob/master/server/docs/md-assets/5_props.png?raw=true)
