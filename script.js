function redirecionar(tipo) {
  switch (tipo) {
    case '1_batalhão':
      window.location.href = "1_batalhão/index.html";
      break;
    case 'Cavalaria':
      window.location.href = "cavalaria_pmw/index.html";
      break
    case '6_batalhão':
      window.location.href = "6_batalhão/index.html";
      break
    case '13_batalhão':
      window.location.href = "13_batalhão/index.html";
      break
    case '1_CIPM':
      window.location.href = "1_CIPM/index.html";
      break
    default:
      alert('Tipo de formulário inválido');
  }
}




