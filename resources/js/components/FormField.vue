<template>
    <DefaultField
        :field="field"
        :errors="errors"
        :show-help-text="showHelpText"
        :full-width-content="fullWidthContent"
    >
        <template #field>
            <template v-if="isVideo">
                <video controls width="300">
                    <source :src="fileData.url" :type="videoType"/>
                    Sorry, your browser doesn't support embedded videos.
                </video>
            </template>
            <template v-else-if="isImage">
                <a :href="fieldValue.url" target="_blank">
                    <img :src="fieldValue.url + '?w=300&h=300'" class="mb-2">
                </a>
            </template>
            <template v-else-if="isFile">
                <a :href="fieldValue.url" target="_blank">{{ fileData.url }}</a>
            </template>

            <button
                :disabled="field.readonly"
                @click.prevent="openKontainer"
                class="shadow relative bg-primary-500 hover:bg-primary-400 text-white dark:text-gray-900 cursor-pointer
                rounded text-sm font-bold focus:outline-none focus:ring ring-primary-200 dark:ring-gray-600 inline-flex
                items-center justify-center h-9 px-3 shadow relative bg-primary-500 hover:bg-primary-400 text-white
                dark:text-gray-900"
                v-text="fieldValue ? __('Edit') : __('Browse')"
            >
                {{ __('Browse') }}
            </button>
            <button
                v-if="fieldValue"
                :disabled="field.readonly"
                @click.prevent="remove"
                class="shadow relative bg-primary-500 hover:bg-primary-400 text-white dark:text-gray-900 cursor-pointer
                rounded text-sm font-bold focus:outline-none focus:ring ring-primary-200 dark:ring-gray-600 inline-flex
                items-center justify-center h-9 px-3 shadow relative bg-primary-500 hover:bg-primary-400 text-white
                dark:text-gray-900"
            >
                {{ __('Unlink') }}
            </button>


        </template>
    </DefaultField>
</template>

<script>
import {FormField, HandlesValidationErrors} from 'laravel-nova'

export default {
    mixins: [FormField, HandlesValidationErrors],

    props: ['resourceName', 'resourceId', 'field'],

    data() {
        return {
            token: null,
            popupWidth: 1024,
            popupHeight: 768,
            popupTop: 0,
            popupLeft: 0,
            fileData: null
        };
    },

    computed: {
        fieldValue() {
            let fv = this.field.displayedAs || this.field.value;
            if (fv != null) {
                fv = JSON.parse(fv);
            }
            return fv;
        },
        isImage() {
            return this.fieldValue && this.fieldValue.type === 'image';
        },
        isVideo() {
            return this.fieldValue && this.fieldValue.type === 'video';
        },
        isFile() {
            return this.fieldValue && !['image', 'video'].includes(this.fieldValue.type);
        },
        videoType() {
            if (!this.fieldValue) {
                return;
            }
            if (/\.mp4/i.test(this.fieldValue.url)) {
                return 'video/mp4';
            }
            if (/\.webm/i.test(this.fieldValue.url)) {
                return 'video/webm';
            }
            return 'unknown';
        },
    },

    mounted() {
        this.token = this.makeId(32);
        this.popupWidth = window.screen.width * 0.8;
        this.popupHeight = window.screen.height * 0.8;
        this.popupTop = (window.screen.height * 0.15) / 2;
        this.popupLeft = (window.screen.width * 0.2) / 2;
        window.addEventListener('message', this.receive, false);
    },

    destroyed() {
        window.removeEventListener('message', this.receive, false);
    },

    methods: {
        /*
         * Set the initial, internal value for the field.
         */
        setInitialValue() {
            if (this.fieldValue) {
                this.fileData = this.fieldValue;
            }
        },

        /**
         * Fill the given FormData object with the field's internal value.
         */
        fill(formData) {
            formData.append(this.field.attribute, this.value || '')
        },

        openKontainer() {
            if (!this.field.kontainerUrl) {
                alert(this.__('Kontainer URL is missing'));
                return;
            }

            // End the Kontainer URL with a trailing slash
            let url = this.field.kontainerUrl.replace(/\/?$/, '/');

            if (this.fieldValue && (this.fieldValue.folderId || this.fieldValue.fileId)) {
                if (this.fieldValue.folderId) {
                    url += 'folder/' + this.fieldValue.folderId + '/';
                }

                if (this.fieldValue.fileId) {
                    url += 'file/' + this.fieldValue.fileId + '/';
                }
            } else {
                url += 'login-cms-redirect/';
            }

            url += '?cmsMode=1&cmsToken=' + this.token;

            window.open(
                url,
                'kontainer',
                'width='+this.popupWidth+',height='+this.popupHeight+',top='+this.popupTop+',left='+this.popupLeft+',popup'
            );
        },

        receive(data) {
            if (!this.field.kontainerUrl.includes(data.origin)) {
                return;
            }
            let imageData = JSON.parse(data.data);
            if (!imageData) {
                alert(this.__('Error parsing image data'));
                return;
            }
            if (!imageData.url) {
                alert(this.__('Invalid URL'));
                return;
            }
            if (imageData.token !== this.token) {
                return;
            }

            if (! ['image', 'video', 'file'].includes(imageData.type)) {
                alert(this.__('Unknown type'));
                return;
            }
            if (this.field.allowType === 'images' && imageData.type !== 'image') {
                alert(this.__('Only images allowed'));
                return;
            }
            if (this.field.allowType === 'videos' && imageData.type !== 'video') {
                alert(this.__('Only videos allowed'));
                return;
            }
            if (this.field.allowType === 'files' && imageData.type !== 'file') {
                alert(this.__('Only files allowed'));
                return;
            }

            this.field.value = JSON.stringify(imageData);
        },

        remove() {
            this.field.value = null;
        },

        makeId(length) {
            let result = '';
            let characters =
                "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let charactersLength = characters.length;
            for (let i = 0; i < length; i++) {
                result += characters.charAt(
                    Math.floor(Math.random() * charactersLength)
                );
            }
            return result;
        },
    },
}
</script>
