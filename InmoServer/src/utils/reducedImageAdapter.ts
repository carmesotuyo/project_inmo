export async function reduceImages(images: string[]): Promise<string[]> {
    return images.map(image => `${image}_reduced`);
  }