document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('checklist-form');
  const midiaInput = document.getElementById('midia');
  const canvas = document.getElementById('signature-pad');
  const signaturePad = new SignaturePad(canvas);
  const clearButton = document.getElementById('clear-signature');

  clearButton.addEventListener('click', () => {
    signaturePad.clear();
  });

  function resizeCanvas() {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
    signaturePad.clear();
  }

  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitButton = document.getElementById('submit-btn');
    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    if (signaturePad.isEmpty()) {
      alert("Por favor, forneça sua assinatura digital.");
      submitButton.disabled = false;
      submitButton.textContent = "Enviar";
      return;
    }

    const formData = new FormData(form);

    // Coloca a assinatura em base64 no formData (campo oculto)
    formData.set('AssinaturaBase64', signaturePad.toDataURL('image/png'));

    // Limpa os arquivos antigos e adiciona todos arquivos do input "midia"
    formData.delete('midia');
    for (const file of midiaInput.files) {
      formData.append('midia', file);
    }

    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbyN5DJsXONVsZFXJHKVX0gOi8XJzdebrsDCnLjTtDDUwurx3LFuIHs_WFFMhCFc6MPKgg/exec", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (result.status === "success" && result.pdf) {
        sessionStorage.setItem("pdfUrl", result.pdf);
        form.reset();
        signaturePad.clear();
        window.location.href = "sucesso.html";
      } else {
        alert("Erro ao gerar PDF: " + (result.message || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar o formulário.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Enviar";
    }
  });
});
