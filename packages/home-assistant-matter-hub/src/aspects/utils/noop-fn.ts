import { Logger } from 'winston';

export function noopFn(logger: Logger, name: string): () => void {
  return () => {
    logger.warn(
      [
        'Matter Command "%s" was called, which is currently not supported.',
        'Please create a new issue at https://github.com/t0bst4r/matterbridge-home-assistant/issues and provide as much information as possible:',
        ' - Which Matter controller (e.g. Alexa, Google Home, Apple Home, Tuya, ...) are you using?',
        ' - What kind of device produced this warning?',
        ' - What (voice) command did you use to trigger this log message?',
        ' - Please provide the relevant log output (this message and some lines before and after this message)',
      ].join('\n'),
      name,
    );
  };
}
