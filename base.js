document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');
  const fotoInput = document.getElementById('foto-motorista');
  
  // Configuração da área de assinatura
  const canvas = document.getElementById('signature-pad');
  const signaturePad = new SignaturePad(canvas);
  const clearButton = document.getElementById('clear-signature');
  const signatureInput = document.getElementById('assinatura-base64');
  
  // Botão para limpar assinatura
  clearButton.addEventListener('click', () => {
    signaturePad.clear();
    signatureInput.value = '';
  });

  // Ajusta o canvas quando a janela é redimensionada
  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear(); // Limpa ao redimensionar
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Valida se a assinatura foi feita
    if (signaturePad.isEmpty()) {
      alert('Por favor, forneça sua assinatura digital');
      return;
    }
    
    // Converte a assinatura para base64
    signatureInput.value = signaturePad.toDataURL('image/png');

    const formData = new FormData(form);
    const data = {};
    
    // Processa os dados do formulário
    formData.forEach((value, key) => {
      if (data[key]) {
        data[key] += `, ${value}`;
      } else {
        data[key] = value;
      }
    });

    // Processa a foto
    if (fotoInput.files.length > 0) {
      const fotoFile = fotoInput.files[0];
      const fotoBase64 = await toBase64(fotoFile);
      data.FotoBase64 = fotoBase64;
      data.FotoNome = fotoFile.name;
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxN_dJPA14vVdjYMs66NT8oLUIBFehGTvGfpRcfQ2XXyagd7efOae2g4MlttwZYRP5H0g/exec", {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      alert("Formulário enviado com sucesso!");
      form.reset();
      signaturePad.clear(); // Limpa a assinatura após envio
    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar o formulário.");
    }
  });

  // Função para converter arquivo para base64
  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
});