document.addEventListener('DOMContentLoaded', (event) => {
    const fileInput = document.getElementById('file-input');
    const fileUploadLabel = document.querySelector('.custom-file-upload');
    const fileList = document.getElementById('file-list');
    const uploadBox = document.getElementById('upload-box');
    const resetButton = document.getElementById('reset-button');
    const nextButton = document.getElementById('next-button');
    const pasteArea = document.getElementById('paste-area');

    let uploadedFiles = [];
    let results = [];
    let questionIdCounts = new Set();

    // Thêm lớp 'show' vào phần tử 'center-box' khi trang được tải
    const centerBox = document.querySelector('.center-box');
    setTimeout(() => {
        centerBox.classList.add('show');
    }, 100); // Delay to trigger the animation

    const handleFiles = (files) => {
        let valid = true;
        const maxFiles = 100;
        const maxSize = 50 * 1024 * 1024; // 50 MB

        if (files.length > maxFiles) {
            alert('You can only upload up to 100 files.');
            fileInput.value = ''; // Reset the file input value
            return;
        }

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType = file.type;
            const fileSize = file.size;

            if (fileSize > maxSize) {
                valid = false;
                alert(`File ${file.name} exceeds the maximum size of 50 MB.`);
                break;
            }

            if (!fileType.match('text/plain') && !fileType.match('application/json') && !fileType.match('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
                valid = false;
                fileUploadLabel.classList.add('invalid');
                setTimeout(() => {
                    fileUploadLabel.classList.remove('invalid');
                }, 2000); // Remove the invalid class after 2 seconds
                break;
            }

            const fileItem = document.createElement('div');
            fileItem.classList.add('file-item');

            const fileName = document.createElement('span');
            fileName.classList.add('file-name');
            fileName.textContent = file.name;

            const deleteButton = document.createElement('span');
            deleteButton.classList.add('delete-button');
            deleteButton.textContent = 'x';
            deleteButton.addEventListener('click', () => {
                fileItem.remove();
                uploadedFiles = uploadedFiles.filter(f => f !== file);
                if (fileList.children.length === 0) {
                    fileList.style.display = 'none';
                    nextButton.style.display = 'none';
                }
            });

            fileItem.appendChild(fileName);
            fileItem.appendChild(deleteButton);
            fileList.appendChild(fileItem);

            uploadedFiles.push(file); // Store the uploaded file
        }

        if (valid) {
            fileUploadLabel.classList.remove('invalid');
            fileList.style.display = 'block'; // Show the file list
            nextButton.style.display = 'inline-block';
            setTimeout(() => {
                nextButton.classList.add('show');
            }, 100); // Delay to trigger the animation
        } else {
            fileList.style.display = 'none'; // Hide the file list
            nextButton.style.display = 'none';
        }
    };

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    resetButton.addEventListener('click', () => {
        fileList.innerHTML = '';
        fileList.style.display = 'none';
        fileInput.value = ''; // Reset the file input value
        nextButton.style.display = 'none';
        uploadedFiles = []; // Reset the uploaded files
        results = [];
        questionIdCounts.clear(); // Reset the question ID counts
    });

    function cleanHtml(rawHtml) {
        rawHtml = rawHtml.replace(/<figure[^>]*>.*?<img[^>]*>.*?<\/figure>/gi, '<hình ảnh>');
        rawHtml = rawHtml.replace(/<(figure|img)[^>]*>.*?<\/\1>/gi, '<hình ảnh>');
        rawHtml = rawHtml.replace(/<img[^>]*>/gi, '<hình ảnh>');
        rawHtml = rawHtml.replace(/<[^>]+>/g, '');
        rawHtml = rawHtml.replace(/&nbsp;|&amp;|&quot;|&lt;|&gt;/g, ' ');
        rawHtml = rawHtml.replace(/\s+/g, ' ');
        return rawHtml.trim();
    }

    function processFiles(files) {
        return new Promise((resolve) => {
            let results = [];
            let filesProcessed = 0;

            files.forEach(file => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    try {
                        const jsonData = JSON.parse(content);
                        results.push(...parseQuestions(jsonData));
                    } catch (error) {
                        results.push(cleanHtml(content));
                    }
                    filesProcessed++;
                    if (filesProcessed === files.length) {
                        resolve(results);
                    }
                };
                reader.readAsText(file);
            });
        });
    }

    function parseQuestions(data) {
        let result = [];
        let questionIndex = questionIdCounts.size + 1;

        data.data[0].test.forEach(question => {
            const questionId = question.id;

            if (questionIdCounts.has(questionId)) {
                return;
            }

            questionIdCounts.add(questionId);

            const questionText = question.question_direction;
            const answers = question.answer_option;
            const questionCleaned = cleanHtml(questionText);

            let answerCleaned = {};
            answers.forEach((answer, i) => {
                let cleanedAnswer = cleanHtml(answer.value).trim();
                cleanedAnswer = cleanedAnswer.replace(/^\w\.\s*/, '');
                answerCleaned[String.fromCharCode(65 + i)] = cleanedAnswer || '<hình ảnh>';
            });

            result.push(`ID: ${questionId}\nCâu ${questionIndex}: ${questionCleaned}`);
            for (const [key, value] of Object.entries(answerCleaned)) {
                result.push(`${key}. ${value}`);
            }
            result.push("\n");
            questionIndex++;
        });

        return result;
    }

    function downloadTextFile(text, filename) {
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 100); // Revoke the object URL after download
    }

    nextButton.addEventListener('click', async () => {
        if (uploadedFiles.length > 0) {
            const results = await processFiles(uploadedFiles);
            downloadTextFile(results.join('\n'), 'cleaned_file.txt');
            setTimeout(() => {
                window.location.reload();
            }, 100); // Reload the page after download
        }
    });

    // Handle paste event
    document.addEventListener('paste', (e) => {
        pasteArea.focus();
        setTimeout(() => {
            const text = pasteArea.value;
            if (text) {
                const blob = new Blob([text], { type: 'text/plain' });
                const file = new File([blob], `Pasted_Text_${Date.now()}.txt`, { type: 'text/plain' });
                handleFiles([file]);
                pasteArea.value = ''; // Clear the textarea
            }
        }, 100);
    });

    // Drag and drop functionality
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });

    uploadBox.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
});