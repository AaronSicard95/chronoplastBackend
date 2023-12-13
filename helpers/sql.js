function sqlForPatrialUpdate(data){
    let statement = "";
    let vals = [];
    const keys=Object.keys(data);
    for(let i = 0; i < keys.length; i++){
        statement = `${statement}${i!=0?', ':""}${keys[i]} = $${i+1}`;
        vals.push(data[keys[i]]);
    }
    return {statement, vals};
}

function sqlForAdditionInsert(data, required=[]){
    try{
    let columns = "";
    let vals = [];
    let values = "";
    const keys=Object.keys(data).filter(k=>!required.includes(k));
    for(let i = 0; i<keys.length;i++){
        if(required.length===0&&i===0){
            columns = `${keys[i]}`
        }else{
            columns = `${columns}, ${keys[i]}`;
        }
        if(required.length===0&&i===0){
            values=`$${i+required.length+1}`
        }else{
            values = `${values}, $${i+required.length+1}`;
        }
        vals.push(data[keys[i]]);
    }
    return {columns, values, vals};
    }catch(err){
        return err;
    }
}

module.exports={
    sqlForPatrialUpdate,
    sqlForAdditionInsert
}