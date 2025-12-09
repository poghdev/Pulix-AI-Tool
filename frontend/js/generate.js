document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const downloadBtn = document.getElementById('download-btn');
    const promptTextarea = document.getElementById('image-prompt');
    const styleSelect = document.getElementById('image-style');
    const ratioSelect = document.getElementById('aspect-ratio');
    const negativePromptInput = document.getElementById('negative-prompt');
    const generatedImage = document.getElementById('generated-image');
    const imagePlaceholder = document.querySelector('.image-placeholder');
    const noImageText = document.querySelector('.no-image-text');

    downloadBtn.disabled = true;
    downloadBtn.style.cursor = 'not-allowed';
    downloadBtn.style.opacity = '0.5';

    generateBtn.addEventListener('click', async () => {
        const prompt = promptTextarea.value;
        const style = styleSelect.value;
        const aspectRatio = ratioSelect.value;
        const negativePrompt = negativePromptInput.value;
        const token = localStorage.getItem('token');

        if (!prompt.trim()) {
            alert('Please enter a description for the image.');
            return;
        }

        if (!token) {
            alert('You must be logged in to generate images.');
            window.location.href = '/frontend/public/auth.html';
            return;
        }

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        imagePlaceholder.classList.add('loading');
        noImageText.style.display = 'none';
        generatedImage.style.opacity = '0.5';

        try {
            const response = await fetch('http://localhost:8000/generation/generate-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: prompt,
                    style: style,
                    aspect_ratio: aspectRatio,
                    negative_prompt: negativePrompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to generate image.');
            }

            const data = await response.json();

            generatedImage.src = data.imageUrl;
            generatedImage.style.display = 'block';
            generatedImage.style.opacity = '1';
            noImageText.style.display = 'none';

            downloadBtn.disabled = false;
            downloadBtn.style.cursor = 'pointer';
            downloadBtn.style.opacity = '1';

        } catch (error) {
            alert(`An error occurred: ${error.message}`);
            noImageText.textContent = 'Failed to generate. Please try again.';
            noImageText.style.display = 'block';
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Image';
            imagePlaceholder.classList.remove('loading');
        }
    });

    downloadBtn.addEventListener('click', async () => {
        if (downloadBtn.disabled || !generatedImage.src) return;

        try {
            const response = await fetch(generatedImage.src);
            const blob = await response.blob();

            const objectUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = objectUrl;
            link.download = `pulix-generated-${Date.now()}.png`;
            link.click();

        } catch (error) {
            console.error('Download failed:', error);
            alert('Could not download the image. Please try again.');
        }
    });
});