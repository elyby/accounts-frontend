declare module 'crowdin-api' {
    export interface ProjectInfoFile {
        node_type: 'file';
        id: number;
        name: string;
        created: string;
        last_updated: string;
        last_accessed: string;
        last_revision: string;
    }

    export interface ProjectInfoDirectory {
        node_type: 'directory';
        id: number;
        name: string;
        files: Array<ProjectInfoFile | ProjectInfoDirectory>;
    }

    export interface ProjectInfoResponse {
        details: {
            source_language: {
                name: string;
                code: string;
            };
            name: string;
            identifier: string;
            created: string;
            description: string;
            join_policy: string;
            last_build: string | null;
            last_activity: string;
            participants_count: string; // it's number, but string in the response
            logo_url: string | null;
            total_strings_count: string; // it's number, but string in the response
            total_words_count: string; // it's number, but string in the response
            duplicate_strings_count: number;
            duplicate_words_count: number;
            invite_url: {
                translator: string;
                proofreader: string;
            };
        };
        languages: Array<{
            name: string; // English language name
            code: string;
            can_translate: 0 | 1;
            can_approve: 0 | 1;
        }>;
        files: Array<ProjectInfoFile | ProjectInfoDirectory>;
    }

    export interface LanguageStatusNode {
        node_type: 'directory' | 'file';
        id: number;
        name: string;
        phrases: number;
        translated: number;
        approved: number;
        words: number;
        words_translated: number;
        words_approved: number;
        files: Array<LanguageStatusNode>;
    }

    export interface LanguageStatusResponse {
        files: Array<LanguageStatusNode>;
    }

    type FilesList = Record<string, string | ReadableStream>;

    export default class CrowdinApi {
        constructor(params: { apiKey: string; projectName: string; baseUrl?: string });
        projectInfo(): Promise<ProjectInfoResponse>;
        languageStatus(language: string): Promise<LanguageStatusResponse>;
        exportFile(
            file: string,
            language: string,
            params?: {
                branch?: string;
                format?: 'xliff';
                export_translated_only?: boolean;
                export_approved_only?: boolean;
            },
        ): Promise<string>; // TODO: not sure about Promise return type
        updateFile(
            files: FilesList,
            params: {
                titles?: Record<string, string>;
                export_patterns?: Record<string, string>;
                new_names?: Record<string, string>;
                first_line_contains_header?: string;
                scheme?: string;
                update_option?: 'update_as_unapproved' | 'update_without_changes';
                branch?: string;
            },
        ): Promise<void>;
    }
}
