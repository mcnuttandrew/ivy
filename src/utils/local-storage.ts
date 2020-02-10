export const getHeight = (): number => Number(localStorage.getItem('splitPosHeight'));
export const writeHeight = (size: any): any => localStorage.setItem('splitPosHeight', size);

export const getWidth = (): number => Number(localStorage.getItem('splitPosWidth'));
export const writeWidth = (size: any): any => localStorage.setItem('splitPosWidth', size);

export const getEditorFontSize = (): number => Number(localStorage.getItem('editorFontSize')) || 15;
export const writeEditorFontSize = (size: any): any => localStorage.setItem('editorFontSize', size);

export const getEditorLineWrap = (): boolean => localStorage.getItem('editorLineWrap') === 'true';
export const writeEditorLineWrap = (wrap: any): any => localStorage.setItem('editorLineWrap', wrap);
