<template>
    <div>
        <div v-if="fileData">
            <template v-if="isImage">
                <img class="rounded" :src="fileData.url + '?w=200&h=50'">
            </template>
            <template v-else>
                {{ fileData.url }}
            </template>
        </div>
    </div>
</template>

<script>
export default {
    props: ['resourceName', 'field'],

    data () {
        return {
            fileData: null
        };
    },
    computed: {
        fieldValue() {
            return this.field.displayedAs || this.field.value
        },
        isImage() {
            return this.fileData && this.fileData.type === "image";
        },
    },

    mounted() {
        if (this.fieldValue) {
            this.fileData = JSON.parse(this.fieldValue);
        }
    }
}
</script>
