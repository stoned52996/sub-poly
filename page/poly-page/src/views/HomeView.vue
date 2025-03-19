<template>
    <div class="page-container">
    <div class="markdown-container">
        <div v-html="markdownContent"></div>
    </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { marked } from 'marked'
import axios from 'axios'

export default {
    setup() {
        const markdownContent = ref('')

        const fetchMarkdown = async () => {
            try {
                const response = await axios.get('https://raw.githubusercontent.com/stoned52996/sub-poly/refs/heads/master/README.md')
                markdownContent.value = marked(response.data)
            } catch (error) {
                console.error('Failed to fetch markdown:', error)
            }
        }

        onMounted(() => {
            fetchMarkdown()
        })

        return {
            markdownContent
        }
    }
}
</script>


<style scoped>
.page-container {
    width: 1200px;
    padding: 20px;
    margin: 0 auto;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.markdown-container {
    height: 80vh;
    padding: 24px;
    background-color: #fff;
    border-radius: 8px;
    overflow-y: auto;
    box-sizing: border-box;
}

/* 自定义滚动条样式 */
.markdown-container::-webkit-scrollbar {
    width: 8px;
}

.markdown-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.markdown-container::-webkit-scrollbar-thumb:hover {
    background: #555;
}

:deep(h1) {
    font-size: 2em;
    margin-bottom: 1em;
}

:deep(h2) {
    font-size: 1.5em;
    margin: 1em 0;
}

:deep(p) {
    line-height: 1.6;
    margin: 1em 0;
}

:deep(code) {
    background-color: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
}

:deep(pre) {
    background-color: #f5f5f5;
    padding: 1em;
    border-radius: 5px;
    overflow-x: auto;
}
</style>