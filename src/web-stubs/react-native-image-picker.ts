export const launchImageLibrary = (options: any): Promise<any> => {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) {
        resolve({ didCancel: true });
        return;
      }
      const uri = URL.createObjectURL(file);
      resolve({
        didCancel: false,
        assets: [
          {
            uri,
            fileName: file.name,
            type: file.type,
            fileSize: file.size,
            originalFile: file,
          },
        ],
      });
    };
    input.addEventListener('cancel', () => resolve({ didCancel: true }));
    input.click();
  });
};

export const launchCamera = (options: any): Promise<any> => {
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment'; // opens rear camera on mobile web
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) {
        resolve({ didCancel: true });
        return;
      }
      const uri = URL.createObjectURL(file);
      resolve({
        didCancel: false,
        assets: [
          {
            uri,
            fileName: file.name,
            type: file.type,
            fileSize: file.size,
            originalFile: file,
          },
        ],
      });
    };
    input.addEventListener('cancel', () => resolve({ didCancel: true }));
    input.click();
  });
};
