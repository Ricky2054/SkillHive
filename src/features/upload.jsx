import { run } from './api/ocr';

function Upload() {
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    const text = await file.text(); // If it's a text file
    try {
      const analysis = await run(text);
      console.log(analysis);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <input 
      type="file" 
      accept=".txt,.doc,.docx,.pdf" 
      onChange={handleFileUpload} 
    />
  );
}

export default Upload; 