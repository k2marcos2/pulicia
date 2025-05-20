document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('checklist-form');
    const midiaInput = document.getElementById('midia');
    const canvas = document.getElementById('signature-pad');
    const signaturePad = new SignaturePad(canvas);
    const clearButton = document.getElementById('clear-signature');
    const video = document.getElementById('camera');
    const captureBtn = document.getElementById('capture');
    const previewsContainer = document.getElementById('previews');

    let fotosCapturadas = [];

    // Inicializa a câmera
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(err => {
            console.error("Erro ao acessar câmera: ", err);
            alert("Não foi possível acessar a câmera.");
        });

    // Captura a imagem da câmera
    captureBtn.addEventListener('click', () => {
        const canvasFoto = document.createElement('canvas');
        canvasFoto.width = video.videoWidth;
        canvasFoto.height = video.videoHeight;
        canvasFoto.getContext('2d').drawImage(video, 0, 0);
        canvasFoto.toBlob(blob => {
            fotosCapturadas.push(blob);

            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            img.style.maxWidth = "100px";
            img.style.border = "1px solid #ccc";
            img.style.borderRadius = "6px";
            previewsContainer.appendChild(img);
        }, 'image/jpeg');
    });

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

    form.addEventListener('submit', async(e) => {
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
        formData.set('AssinaturaBase64', signaturePad.toDataURL('image/png'));

        // Converte as fotos da câmera para base64
        const fotosBase64 = await Promise.all(fotosCapturadas.map(blob => {
            return new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        }));
        fotosBase64.forEach((base64, i) => {
            formData.append(`MidiaBase64_${i}`, base64);
        });

        // Converte imagens da galeria para base64
        const galeriaFiles = Array.from(midiaInput.files);
        for (let i = 0; i < galeriaFiles.length; i++) {
            const file = galeriaFiles[i];
            const base64 = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
            formData.append(`MidiaBase64_${fotosBase64.length + i}`, base64);
        }

        try {
            const response = await fetch("https://script.google.com/macros/s/AKfycbzuwLgP0i4823mQdpI7vdNZks5OiNlM0mclNv3OUa2kVOs8rDanEG8MC6QM0pTE8FRpcA/exec", {
                method: "POST",
                body: formData
            });

            const result = await response.json();

            if (result.status === "success" && result.pdf) {
                sessionStorage.setItem("pdfUrl", result.pdf);
                form.reset();
                signaturePad.clear();
                previewsContainer.innerHTML = "";
                fotosCapturadas = [];
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