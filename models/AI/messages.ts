import { LanguageKey } from "brancy/i18n";

export type MessageMap = {
  CONSOLE_ERRORS: {
    MEDIA_RECORDER_ERROR: string;
    VOICE_RECORD_ERROR: string;
    UPLOAD_ERROR: string;
    VOICE_FETCH_ERROR: string;
    ADD_OUTPUT_ERROR: string;
    EDITOR_INIT_ERROR: string;
    JSON_PARSE_ERROR: string;
    POSITION_ERROR: string;
    NODE_REMOVE_ERROR: string;
    CONNECTION_ERROR: string;
    GENERIC_CONNECTION_ERROR: string;
    VOICE_PLAY_ERROR: string;
    NODE_CONNECTION_WARNING: string;
    UNKNOWN_VALUE_TYPE: string;
    UNKNOWN_BLOCK_TYPE: string;
  };
  ALERTS: {
    MIN_OUTPUT_REQUIRED: string;
    GENERIC_ITEM_CONNECTION_ONLY: string;
    WEBLINK_GENERIC_ITEM_ONLY: string;
    VOICE_RECORD_FAILED: string;
    VOICE_RECORD_SUCCESS: string;
    VOICE_UPLOAD_FAILED: string;
    VOICE_RECORD_EMPTY: string;
    VOICE_RECORD_ERROR: string;
    VOICE_RECORD_START: string;
    VOICE_PLAY_ERROR: string;
    QUICK_REPLY_VALIDATION_ERROR: string;
    GENERIC_ITEM_VALIDATION_ERROR: string;
    WEBLINK_VALIDATION_ERROR: string;
    NO_ON_MESSAGE_NODE: string;
    MAX_QUICK_REPLY_OUTPUTS: string;
    MAX_GENERIC_OUTPUTS: string;
    SESSION_INVALID: string;
    SUBTITLE_SUCCESS: string;
    ADD_OUTPUT_ERROR: string;
  };
  INTERNAL_NOTIFICATIONS: {
    EMPTY_TITLE_FOR_FLOW: string;
    MULTIPLE_FLOW_FOR_PRIVATE_REPLY: string;
    SUCCESS: string;
  };
  NOTIFICATIONS: {
    UNEXPECTED_ERROR: string;
    VALIDATION_WARNING: string;
    SERVER_ERROR: string;
  };
  VALIDATION_DETAILS: {
    QUICK_REPLY_BLOCK_TITLE_EMPTY: string;
    QUICK_REPLY_OPTION_TITLE_EMPTY: string;
    GENERIC_ITEM_TITLE_EMPTY: string;
    GENERIC_ITEM_OUTPUT_TITLE_EMPTY: string;
    WEBLINK_EMPTY: string;
    WEBLINK_INCOMPLETE: string;
    WEBLINK_INVALID_FORMAT: string;
    WEBLINK_NON_ENGLISH: string;
    WEBLINK_HAS_HYPHEN: string;
    SUBTITLE_INPUT: string;
  };
};

export function createMessageMap(t: (key: any) => string): MessageMap {
  return {
    CONSOLE_ERRORS: {
      MEDIA_RECORDER_ERROR: t(LanguageKey.AIFlow_media_recorder_error),
      VOICE_RECORD_ERROR: t(LanguageKey.AIFlow_voice_record_error),
      UPLOAD_ERROR: t(LanguageKey.AIFlow_upload_error),
      VOICE_FETCH_ERROR: t(LanguageKey.AIFlow_voice_fetch_error),
      ADD_OUTPUT_ERROR: t(LanguageKey.AIFlow_add_output_error),
      EDITOR_INIT_ERROR: t(LanguageKey.AIFlow_editor_init_error),
      JSON_PARSE_ERROR: t(LanguageKey.AIFlow_json_parse_error),
      POSITION_ERROR: t(LanguageKey.AIFlow_position_error),
      NODE_REMOVE_ERROR: t(LanguageKey.AIFlow_node_remove_error),
      CONNECTION_ERROR: t(LanguageKey.AIFlow_connection_error),
      GENERIC_CONNECTION_ERROR: t(LanguageKey.AIFlow_generic_connection_error),
      VOICE_PLAY_ERROR: t(LanguageKey.AIFlow_voice_play_error),
      NODE_CONNECTION_WARNING: t(LanguageKey.AIFlow_node_connection_warning),
      UNKNOWN_VALUE_TYPE: t(LanguageKey.AIFlow_unknown_value_type),
      UNKNOWN_BLOCK_TYPE: t(LanguageKey.AIFlow_unknown_block_type_alert),
    },
    ALERTS: {
      MIN_OUTPUT_REQUIRED: t(LanguageKey.AIFlow_min_output_required),
      GENERIC_ITEM_CONNECTION_ONLY: t(LanguageKey.AIFlow_generic_item_connection_only),
      WEBLINK_GENERIC_ITEM_ONLY: t(LanguageKey.AIFlow_weblink_generic_item_only),
      VOICE_RECORD_FAILED: t(LanguageKey.AIFlow_voice_record_failed),
      VOICE_RECORD_SUCCESS: t(LanguageKey.AIFlow_voice_record_success),
      VOICE_UPLOAD_FAILED: t(LanguageKey.AIFlow_voice_upload_failed),
      VOICE_RECORD_EMPTY: t(LanguageKey.AIFlow_voice_record_empty),
      VOICE_RECORD_ERROR: t(LanguageKey.AIFlow_voice_record_error),
      VOICE_RECORD_START: t(LanguageKey.AIFlow_voice_record_start),
      VOICE_PLAY_ERROR: t(LanguageKey.AIFlow_voice_play_error),
      QUICK_REPLY_VALIDATION_ERROR: t(LanguageKey.AIFlow_quick_reply_validation_error),
      GENERIC_ITEM_VALIDATION_ERROR: t(LanguageKey.AIFlow_generic_item_validation_error),
      WEBLINK_VALIDATION_ERROR: t(LanguageKey.AIFlow_weblink_validation_error),
      NO_ON_MESSAGE_NODE: t(LanguageKey.AIFlow_no_on_message_node),
      MAX_QUICK_REPLY_OUTPUTS: t(LanguageKey.AIFlow_max_quick_reply_outputs),
      MAX_GENERIC_OUTPUTS: t(LanguageKey.AIFlow_max_generic_outputs),
      SESSION_INVALID: t(LanguageKey.AIFlow_session_invalid),
      SUBTITLE_SUCCESS: t(LanguageKey.AIFlow_subtitle_success),
      ADD_OUTPUT_ERROR: t(LanguageKey.AIFlow_add_output_error_alert),
    },
    INTERNAL_NOTIFICATIONS: {
      EMPTY_TITLE_FOR_FLOW: t(LanguageKey.AIFlow_empty_title_for_flow_alert),
      MULTIPLE_FLOW_FOR_PRIVATE_REPLY: t(LanguageKey.AIFlow_multiple_flow_for_private_reply_alert),
      SUCCESS: t(LanguageKey.AIFlow_success),
    },
    NOTIFICATIONS: {
      UNEXPECTED_ERROR: t(LanguageKey.AIFlow_unexpected_error),
      VALIDATION_WARNING: t(LanguageKey.AIFlow_validation_warning),
      SERVER_ERROR: t(LanguageKey.AIFlow_server_error),
    },
    VALIDATION_DETAILS: {
      QUICK_REPLY_BLOCK_TITLE_EMPTY: t(LanguageKey.AIFlow_quick_reply_block_title_empty),
      QUICK_REPLY_OPTION_TITLE_EMPTY: t(LanguageKey.AIFlow_quick_reply_option_title_empty),
      GENERIC_ITEM_TITLE_EMPTY: t(LanguageKey.AIFlow_generic_item_title_empty_alert),
      GENERIC_ITEM_OUTPUT_TITLE_EMPTY: t(LanguageKey.AIFlow_generic_item_output_title_empty_alert),
      WEBLINK_EMPTY: t(LanguageKey.AIFlow_weblink_empty_alert),
      WEBLINK_INCOMPLETE: t(LanguageKey.AIFlow_weblink_incomplete_alert),
      WEBLINK_INVALID_FORMAT: t(LanguageKey.AIFlow_weblink_invalid_format_alert),
      WEBLINK_NON_ENGLISH: t(LanguageKey.AIFlow_weblink_non_english_alert),
      WEBLINK_HAS_HYPHEN: t(LanguageKey.AIFlow_weblink_has_hyphen_alert),
      SUBTITLE_INPUT: t(LanguageKey.AIFlow_subtitle_input),
    },
  };
}
