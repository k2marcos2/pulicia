function redirecionar(tipo) {
  switch (tipo) {
    case '1_batalhão':
      window.location.href = "1_batalhão/index.html";
      break;
    case 'Cavalaria':
      window.location.href = "cavalaria_pmw/index.html";
      break
    default:
      alert('Tipo de formulário inválido');
  }
}




