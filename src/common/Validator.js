const validateRequired = (value, field) => {
  if(!value){
    return `El campo ${field} no debe estar vacio`;
  }
}
export  {validateRequired}
