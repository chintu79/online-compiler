export const LANGUAGES = {
  javascript: {
    id: 'javascript',
    label: 'JavaScript',
    monacoLang: 'javascript',
    // Wandbox compiler name
    wandboxCompiler: 'nodejs-20.17.0',
    icon: 'JS',
    fileName: 'prog.js',
    defaultCode: `// JavaScript - Hello World
// Try editing and running this code!

console.log("Hello Developer!");
`,
  },
  java: {
    id: 'java',
    label: 'Java',
    monacoLang: 'java',
    // Wandbox compiler name
    wandboxCompiler: 'openjdk-jdk-22+36',
    icon: 'JV',
    fileName: 'prog.java',
    defaultCode: `// Java - Hello World
// Try editing and running this code!

import java.util.Arrays;

public class prog {
    public static void main(String[] args) {
        System.out.println("Hello, Developer! Welcome to the Code Editor.");
    }
}
`,
  },
};

export const LANGUAGE_LIST = Object.values(LANGUAGES);

export const DEFAULT_LANGUAGE = 'javascript';
