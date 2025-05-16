document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');
  const midiaInput = document.getElementById('midia');
  const canvas = document.getElementById('signature-pad');
  const signaturePad = new SignaturePad(canvas);
  const clearButton = document.getElementById('clear-signature');
  const signatureInput = document.getElementById('assinatura-base64');

  clearButton.addEventListener('click', () => {
    signaturePad.clear();
    signatureInput.value = '';
  });

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear();
  }
// Valida RG (simples)
  function validarRG(rg) {
    rg = rg.replace(/[^\dA-Za-z]+/g, '');
    return rg.length >= 5 && rg.length <= 14;
  }


  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const rg = form.querySelector('[name="RG"]').value;
    if (!validarRG(rg)) {
      alert("RG inválido!");
      return;
    }

    if (signaturePad.isEmpty()) {
      alert("Por favor, forneça sua assinatura digital.");
      return;
    }

    signatureInput.value = signaturePad.toDataURL('image/png');

    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      if (data[key]) data[key] += `, ${value}`;
      else data[key] = value;
    });

    data.Midias = [];
    for (let file of midiaInput.files) {
      const base64 = await toBase64(file);
      data.Midias.push({
        nome: file.name,
        tipo: file.type,
        base64: base64
      });
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxakNmPwLOkkMjBcOLRKwm9RJhmE2drfk7Wtj00EzvZ4MlC2Q-evvkCxxpMwxeJSi9IpQ/exec", {
        method: "POST",
        body: JSON.stringify(data)
      });

      alert("Formulário enviado com sucesso!");
      form.reset();
      signaturePad.clear();
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar o formulário.");
    }
  });

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

});
