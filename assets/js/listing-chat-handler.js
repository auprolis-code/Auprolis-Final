// Rule-Based Chat Handler for Listing Creation
class ListingChatHandler {
    constructor(adminHandler) {
        this.adminHandler = adminHandler;
        this.listingData = {};
        this.currentStep = 0;
        this.questions = this.initializeQuestions();
        this.uploadedImages = [];
    }

    initializeQuestions() {
        return [
            {
                id: 'title',
                type: 'text',
                question: "👋 Welcome! Let's create your asset listing. First, what's the title of your asset?",
                placeholder: "e.g., 2019 Toyota Corolla",
                required: true,
                validate: (value) => {
                    if (!value || value.trim().length < 3) {
                        return "Please provide a title with at least 3 characters.";
                    }
                    return null;
                }
            },
            {
                id: 'category',
                type: 'select',
                question: "Great! What category does this asset belong to?",
                options: [
                    { value: 'property', label: '🏠 Property' }
                ],
                required: true,
                validate: (value) => {
                    if (!value) {
                        return "Please select a category.";
                    }
                    return null;
                }
            },
            {
                id: 'location',
                type: 'text',
                question: "Where is this asset located?",
                placeholder: "e.g., Gaborone, Botswana",
                required: true,
                validate: (value) => {
                    if (!value || value.trim().length < 2) {
                        return "Please provide a valid location.";
                    }
                    return null;
                }
            },
            {
                id: 'condition',
                type: 'select',
                question: "What's the condition of this asset?",
                options: [
                    { value: 'excellent', label: '✨ Excellent - Like new' },
                    { value: 'good', label: '👍 Good - Minor wear' },
                    { value: 'fair', label: '⚖️ Fair - Some wear' },
                    { value: 'poor', label: '⚠️ Poor - Significant wear' }
                ],
                required: true,
                validate: (value) => {
                    if (!value) {
                        return "Please select a condition.";
                    }
                    return null;
                }
            },
            {
                id: 'description',
                type: 'textarea',
                question: "Please provide a detailed description of the asset. Include any important features or details buyers should know.",
                placeholder: "Describe the asset in detail...",
                required: true,
                validate: (value) => {
                    if (!value || value.trim().length < 10) {
                        return "Description must be at least 10 characters long.";
                    }
                    return null;
                }
            },
            {
                id: 'startingBid',
                type: 'number',
                question: "What's the starting bid price in BWP (Botswana Pula)?",
                placeholder: "e.g., 50000",
                required: true,
                validate: (value) => {
                    const num = parseFloat(value);
                    if (!value || isNaN(num) || num < 0) {
                        return "Please enter a valid positive number.";
                    }
                    return null;
                }
            },
            {
                id: 'reservePrice',
                type: 'number',
                question: "Do you have a reserve price? (Optional - leave blank to skip)",
                placeholder: "e.g., 60000",
                required: false,
                validate: (value) => {
                    if (value && value.trim() !== '') {
                        const num = parseFloat(value);
                        if (isNaN(num) || num < 0) {
                            return "Please enter a valid positive number or leave blank.";
                        }
                    }
                    return null;
                }
            },
            {
                id: 'startDate',
                type: 'datetime',
                question: "When should the auction start?",
                required: true,
                validate: (value) => {
                    if (!value) {
                        return "Please select a start date and time.";
                    }
                    const date = new Date(value);
                    if (isNaN(date.getTime()) || date < new Date()) {
                        return "Start date must be in the future.";
                    }
                    return null;
                }
            },
            {
                id: 'endDate',
                type: 'datetime',
                question: "When should the auction end?",
                required: true,
                validate: (value) => {
                    if (!value) {
                        return "Please select an end date and time.";
                    }
                    const date = new Date(value);
                    const startDate = this.listingData.startDate ? new Date(this.listingData.startDate) : null;
                    if (isNaN(date.getTime())) {
                        return "Please enter a valid date and time.";
                    }
                    if (startDate && date <= startDate) {
                        return "End date must be after the start date.";
                    }
                    if (date < new Date()) {
                        return "End date must be in the future.";
                    }
                    return null;
                }
            },
            {
                id: 'year',
                type: 'number',
                question: "What year is this asset from? (Optional - leave blank to skip)",
                placeholder: "e.g., 2019",
                required: false,
                validate: (value) => {
                    if (value && value.trim() !== '') {
                        const num = parseInt(value);
                        if (isNaN(num) || num < 1900 || num > new Date().getFullYear() + 1) {
                            return `Please enter a valid year between 1900 and ${new Date().getFullYear() + 1}.`;
                        }
                    }
                    return null;
                }
            },
            {
                id: 'size',
                type: 'text',
                question: "What's the size or area? (Optional - e.g., 250 sqm, 4 bedrooms)",
                placeholder: "e.g., 250 sqm, 4 bedrooms",
                required: false,
                validate: () => null
            },
            {
                id: 'mileage',
                type: 'text',
                question: "What's the mileage or hours? (Optional - e.g., 85000 km, 2500 hours)",
                placeholder: "e.g., 85000 km",
                required: false,
                validate: () => null
            },
            {
                id: 'fuelType',
                type: 'select',
                question: "What's the fuel type? (Optional - leave blank to skip)",
                options: [
                    { value: '', label: 'Skip this question' },
                    { value: 'petrol', label: '⛽ Petrol' },
                    { value: 'diesel', label: '🛢️ Diesel' },
                    { value: 'electric', label: '🔌 Electric' },
                    { value: 'hybrid', label: '🔋 Hybrid' }
                ],
                required: false,
                validate: () => null
            },
            {
                id: 'images',
                type: 'file',
                question: "📷 Would you like to upload images of the asset? (Optional - you can skip this)",
                required: false,
                validate: () => null
            },
            {
                id: 'contactName',
                type: 'text',
                question: "What's the contact person's name?",
                placeholder: "e.g., John Doe",
                required: true,
                validate: (value) => {
                    if (!value || value.trim().length < 2) {
                        return "Please provide a valid name.";
                    }
                    return null;
                }
            },
            {
                id: 'contactPhone',
                type: 'tel',
                question: "What's the contact phone number?",
                placeholder: "e.g., +267 123 4567",
                required: true,
                validate: (value) => {
                    if (!value || value.trim().length < 7) {
                        return "Please provide a valid phone number.";
                    }
                    return null;
                }
            },
            {
                id: 'contactEmail',
                type: 'email',
                question: "What's the contact email address?",
                placeholder: "e.g., contact@example.com",
                required: true,
                validate: (value) => {
                    if (!value) {
                        return "Please provide an email address.";
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        return "Please provide a valid email address.";
                    }
                    return null;
                }
            }
        ];
    }

    start() {
        console.log('Starting chat handler...');
        this.currentStep = 0;
        this.listingData = {};
        this.uploadedImages = [];
        const chatMessages = document.getElementById('chatMessages');
        const chatInputContainer = document.getElementById('chatInputContainer');
        
        if (chatMessages) chatMessages.innerHTML = '';
        if (chatInputContainer) chatInputContainer.innerHTML = '';
        
        // Ensure handler is globally accessible
        window.listingChatHandler = this;
        console.log('Chat handler initialized and set to window.listingChatHandler');
        
        this.updateProgress();
        this.askNextQuestion();
    }

    askNextQuestion() {
        if (this.currentStep >= this.questions.length) {
            this.completeListing();
            return;
        }

        const question = this.questions[this.currentStep];
        this.addBotMessage(question.question);
        
        // Small delay before showing input
        setTimeout(() => {
            this.renderInput(question);
        }, 500);
    }

    addBotMessage(text) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        // Handle multi-line text by converting newlines to <br>
        const formattedText = text.split('\n').map((line, index) => {
            if (index === 0) return line;
            return `<br>${line}`;
        }).join('');

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message bot';
        messageDiv.innerHTML = `
            <div class="chat-avatar">🤖</div>
            <div class="chat-bubble">
                <p>${formattedText}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    addUserMessage(text) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `
            <div class="chat-avatar">👤</div>
            <div class="chat-bubble">
                <p>${text}</p>
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    renderInput(question) {
        const chatInputContainer = document.getElementById('chatInputContainer');
        if (!chatInputContainer) return;

        let inputHTML = '';
        const errorDiv = '<div class="chat-error" id="chatError" style="display: none;"></div>';

        switch (question.type) {
            case 'text':
            case 'email':
            case 'tel':
                inputHTML = `
                    <div class="chat-input-wrapper">
                        <input 
                            type="${question.type}" 
                            class="chat-input-field" 
                            id="chatInput" 
                            placeholder="${question.placeholder || ''}"
                            autocomplete="off"
                        >
                        <button class="chat-send-btn" onclick="if(window.listingChatHandler){window.listingChatHandler.handleAnswer();}else{console.error('listingChatHandler not available');}">Send →</button>
                    </div>
                    ${errorDiv}
                `;
                break;

            case 'textarea':
                inputHTML = `
                    <div class="chat-input-wrapper">
                        <textarea 
                            class="chat-input-field textarea" 
                            id="chatInput" 
                            placeholder="${question.placeholder || ''}"
                            rows="4"
                        ></textarea>
                        <button class="chat-send-btn" onclick="if(window.listingChatHandler){window.listingChatHandler.handleAnswer();}else{console.error('listingChatHandler not available');}">Send →</button>
                    </div>
                    ${errorDiv}
                `;
                break;

            case 'number':
                inputHTML = `
                    <div class="chat-input-wrapper">
                        <input 
                            type="number" 
                            class="chat-input-field number" 
                            id="chatInput" 
                            placeholder="${question.placeholder || ''}"
                            min="0"
                            step="${question.id === 'year' ? '1' : '0.01'}"
                        >
                        <button class="chat-send-btn" onclick="if(window.listingChatHandler){window.listingChatHandler.handleAnswer();}else{console.error('listingChatHandler not available');}">Send →</button>
                    </div>
                    ${errorDiv}
                `;
                break;

            case 'select':
                const optionsHTML = question.options.map((opt, index) => {
                    // Escape quotes in label for onclick handler
                    const escapedLabel = opt.label.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    const escapedValue = opt.value.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    return `<div class="chat-option" data-value="${escapedValue}" data-index="${index}" onclick="if(window.listingChatHandler){window.listingChatHandler.selectOption('${escapedValue}', '${escapedLabel}');}else{console.error('listingChatHandler not available');}">${opt.label}</div>`;
                }).join('');
                
                inputHTML = `
                    <div class="chat-options-container">
                        <div class="options-list">${optionsHTML}</div>
                    </div>
                    ${errorDiv}
                `;
                break;

            case 'datetime':
                inputHTML = `
                    <div class="chat-input-wrapper">
                        <input 
                            type="datetime-local" 
                            class="chat-input-field" 
                            id="chatInput"
                            min="${new Date().toISOString().slice(0, 16)}"
                        >
                        <button class="chat-send-btn" onclick="if(window.listingChatHandler){window.listingChatHandler.handleAnswer();}else{console.error('listingChatHandler not available');}">Send →</button>
                    </div>
                    ${errorDiv}
                `;
                break;

            case 'file':
                inputHTML = `
                    <div class="chat-file-upload" onclick="document.getElementById('chatFileInput').click()">
                        <div class="chat-file-upload-icon">📷</div>
                        <div class="chat-file-upload-text">Click to upload images or drag and drop</div>
                        <input type="file" id="chatFileInput" multiple accept="image/*" style="display: none;" onchange="if(window.listingChatHandler){window.listingChatHandler.handleFileUpload(event);}else{console.error('listingChatHandler not available');}">
                    </div>
                    <div class="chat-uploaded-images" id="chatUploadedImages"></div>
                    <div class="chat-input-wrapper" style="margin-top: 1rem;">
                        <button class="chat-send-btn" onclick="if(window.listingChatHandler){window.listingChatHandler.handleAnswer();}else{console.error('listingChatHandler not available');}" style="width: 100%;">${this.uploadedImages.length > 0 ? 'Continue →' : 'Skip this step →'}</button>
                    </div>
                    ${errorDiv}
                `;
                break;
        }

        chatInputContainer.innerHTML = inputHTML;

        // Add event delegation for select options (more robust than inline onclick)
        if (question.type === 'select') {
            const optionsList = chatInputContainer.querySelector('.options-list');
            if (optionsList) {
                optionsList.addEventListener('click', (e) => {
                    const option = e.target.closest('.chat-option');
                    if (option) {
                        const value = option.getAttribute('data-value');
                        const label = option.textContent.trim();
                        if (window.listingChatHandler) {
                            window.listingChatHandler.selectOption(value, label);
                        } else {
                            console.error('listingChatHandler not available');
                        }
                    }
                });
            }
        }

        // Auto-focus text inputs
        if (question.type !== 'select' && question.type !== 'file') {
            const input = document.getElementById('chatInput');
            if (input) {
                setTimeout(() => input.focus(), 100);
                
                // Allow Enter key to submit (except for textarea)
                if (question.type !== 'textarea') {
                    input.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            if (window.listingChatHandler) {
                                window.listingChatHandler.handleAnswer();
                            }
                        }
                    });
                }
            }
        }

        // Debug: Log handler availability
        console.log('Chat handler available:', !!window.listingChatHandler);
    }

    selectOption(value, label) {
        console.log('selectOption called:', { value, label, currentStep: this.currentStep });
        
        // Remove previous selections
        document.querySelectorAll('.chat-option').forEach(opt => {
            opt.classList.remove('selected');
        });

        // Mark selected
        const selected = document.querySelector(`[data-value="${value}"]`);
        if (selected) {
            selected.classList.add('selected');
            console.log('Option selected:', selected);
        } else {
            console.warn('Selected option not found in DOM:', value);
        }

        // Store value and move to next question after short delay
        setTimeout(() => {
            const question = this.questions[this.currentStep];
            if (!question) {
                console.error('No question found at current step:', this.currentStep);
                return;
            }
            
            // Only store if value is provided (not empty string for optional fields)
            if (value !== '' || question.required) {
                this.listingData[question.id] = value || null;
                console.log('Stored data:', { field: question.id, value: this.listingData[question.id] });
            }
            this.addUserMessage(value === '' ? 'Skip' : label);
            this.currentStep++;
            this.updateProgress();
            this.askNextQuestion();
        }, 300);
    }

    handleAnswer() {
        const question = this.questions[this.currentStep];
        const input = document.getElementById('chatInput');
        const errorDiv = document.getElementById('chatError');

        if (!input && question.type !== 'file') {
            return;
        }

        let value = '';
        if (question.type === 'file') {
            value = this.uploadedImages.length > 0 ? 'uploaded' : '';
        } else {
            value = input.value.trim();
        }

        // Validate
        if (question.validate) {
            const error = question.validate(value);
            if (error) {
                if (errorDiv) {
                    errorDiv.textContent = error;
                    errorDiv.style.display = 'block';
                }
                return;
            }
        }

        // Store value
        if (question.type === 'file') {
            this.listingData.images = this.uploadedImages.map(img => img.src);
        } else if (question.type === 'number') {
            this.listingData[question.id] = value && value !== '' ? parseFloat(value) : (question.required ? null : undefined);
        } else if (question.type === 'datetime') {
            this.listingData[question.id] = value && value !== '' ? new Date(value).toISOString() : (question.required ? null : undefined);
        } else {
            // For optional fields, only store if value is provided
            if (question.required || (value && value !== '')) {
                this.listingData[question.id] = value || null;
            }
        }

        // Show user's answer
        if (question.type === 'file') {
            if (this.uploadedImages.length > 0) {
                this.addUserMessage(`Uploaded ${this.uploadedImages.length} image(s)`);
            } else {
                this.addUserMessage('Skip');
            }
        } else {
            const displayValue = value || (question.required ? '' : 'Skip');
            if (displayValue) {
                this.addUserMessage(displayValue);
            }
        }

        // Clear error
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }

        // Move to next question
        this.currentStep++;
        this.updateProgress();
        
        // Small delay before next question
        setTimeout(() => {
            this.askNextQuestion();
        }, 500);
    }

    handleFileUpload(event) {
        const files = Array.from(event.target.files);
        const uploadedImagesDiv = document.getElementById('chatUploadedImages');
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.uploadedImages.push({ file, src: e.target.result });
                    this.renderUploadedImages();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    renderUploadedImages() {
        const uploadedImagesDiv = document.getElementById('chatUploadedImages');
        if (!uploadedImagesDiv) return;

        uploadedImagesDiv.innerHTML = this.uploadedImages.map((img, index) => `
            <div class="chat-uploaded-image">
                <img src="${img.src}" alt="Uploaded image">
                <button class="chat-uploaded-image-remove" onclick="if(window.listingChatHandler){window.listingChatHandler.removeImage(${index});}else{console.error('listingChatHandler not available');}">×</button>
            </div>
        `).join('');
    }

    removeImage(index) {
        this.uploadedImages.splice(index, 1);
        this.renderUploadedImages();
    }

    updateProgress() {
        const totalQuestions = this.questions.length;
        const completed = this.currentStep;
        const percentage = Math.round((completed / totalQuestions) * 100);

        const progressFill = document.getElementById('chatProgressFill');
        const progressText = document.getElementById('chatProgressText');

        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${percentage}% Complete`;
        }
    }

    async completeListing() {
        this.addBotMessage("Perfect! I have all the information I need. Let me create your listing now...");

        // Process the data - clean up undefined values
        const cleanData = {};
        Object.keys(this.listingData).forEach(key => {
            if (this.listingData[key] !== undefined) {
                cleanData[key] = this.listingData[key];
            }
        });

        const listingData = {
            ...cleanData,
            images: this.uploadedImages.length > 0 
                ? this.uploadedImages.map(img => img.src) 
                : ['assets/images/placeholder.txt'],
            contactInfo: {
                name: cleanData.contactName,
                phone: cleanData.contactPhone,
                email: cleanData.contactEmail
            },
            contactName: cleanData.contactName,
            contactPhone: cleanData.contactPhone,
            contactEmail: cleanData.contactEmail,
            startingBid: parseFloat(cleanData.startingBid) || 0,
            currentBid: parseFloat(cleanData.startingBid) || 0,
            reservePrice: cleanData.reservePrice ? parseFloat(cleanData.reservePrice) : undefined,
            startDate: cleanData.startDate ? new Date(cleanData.startDate) : new Date(),
            endDate: cleanData.endDate ? new Date(cleanData.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            status: 'active',
            createdAt: new Date().toISOString(),
            viewCount: 0
        };

        // Add metadata
        listingData.id = `asset-${Date.now()}`;
        listingData.sellerId = this.adminHandler.user?.uid || 'admin';
        listingData.sellerName = this.adminHandler.user?.displayName || this.adminHandler.user?.email || 'Admin';
        listingData.sellerEmail = listingData.contactInfo?.email || this.adminHandler.user?.email || '';

        try {
            // Show saving message
            this.addBotMessage("💾 Saving your listing to the database...");
            
            // Ensure data is properly formatted for Realtime Database
            // Convert dates to timestamps for better Realtime Database compatibility
            const realtimeListingData = {
                ...listingData,
                startDate: listingData.startDate instanceof Date 
                    ? listingData.startDate.toISOString() 
                    : listingData.startDate,
                endDate: listingData.endDate instanceof Date 
                    ? listingData.endDate.toISOString() 
                    : listingData.endDate,
                createdAt: listingData.createdAt || new Date().toISOString(),
                // Ensure assetId is set for Realtime Database
                assetId: listingData.id || listingData.assetId || `asset-${Date.now()}`
            };
            
            // Direct save to Realtime Database first (for instant updates)
            let realtimeDbSaved = false;
            if (this.adminHandler.realtimeDb && this.adminHandler.realtimeDb.db) {
                try {
                    const assetId = realtimeListingData.assetId;
                    console.log('🔴 Chat: Saving directly to Realtime Database...', { assetId, title: listingData.title });
                    await this.adminHandler.realtimeDb.storeAsset(assetId, realtimeListingData);
                    realtimeDbSaved = true;
                    console.log('✅ Chat: Successfully saved to Realtime Database');
                } catch (realtimeError) {
                    console.error('❌ Chat: Error saving to Realtime Database:', realtimeError);
                    // Continue with other save methods even if Realtime DB fails
                }
            }
            
            // Save using admin handler (this also saves to Realtime Database, Firestore, and demo data)
            const saveResults = await this.adminHandler.saveListing(listingData);
            
            // Add to local listings array
            this.adminHandler.listings.push(listingData);

            // Provide detailed feedback about where it was saved
            let successMessage = "✅ Your listing has been created successfully!";
            
            if (realtimeDbSaved || saveResults.realtimeDb) {
                successMessage += "\n\n🔴 Saved to Realtime Database - Your listing will appear instantly for all users!";
            } else {
                successMessage += "\n\n⚠️ Note: Realtime Database not available, but listing was saved to other storage.";
            }
            
            if (saveResults.firebase) {
                successMessage += "\n💾 Saved to Firestore";
            }
            
            if (saveResults.storage) {
                successMessage += "\n📁 Saved to Firebase Storage (all properties as JSON)";
            }
            
            if (saveResults.demo) {
                successMessage += "\n📦 Saved to demo data";
            }
            
            successMessage += "\n\nYour listing is now live on the platform!";
            
            this.addBotMessage(successMessage);
            
            // Close modal after delay
            setTimeout(() => {
                this.adminHandler.closeCreateListingModal();
                this.adminHandler.renderListings();
                this.adminHandler.updateDashboardStats();
                this.adminHandler.loadRecentActivity();
                this.adminHandler.loadSystemAlerts();
            }, 3000);

        } catch (error) {
            console.error('Error creating listing:', error);
            
            let errorMessage = `❌ Sorry, there was an error creating your listing: ${error.message}`;
            
            // Provide helpful error guidance
            if (error.code === 'PERMISSION_DENIED') {
                errorMessage += "\n\n💡 This might be a permissions issue. Please check your Firebase security rules.";
            } else if (error.message.includes('network') || error.message.includes('Network')) {
                errorMessage += "\n\n💡 Please check your internet connection and try again.";
            }
            
            this.addBotMessage(errorMessage);
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);
        }
    }
}

// Export for global access
window.ListingChatHandler = ListingChatHandler;

