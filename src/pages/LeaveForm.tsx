import React, { useState } from "react";
import jsPDF from "jspdf";

// Define the function in the same file
const generateAndPrintPDF = (formData: { name: string; email: string }): void => {
  const doc = new jsPDF();

  // Add content to the PDF
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(16);
  doc.text("Form Submission", 10, 10);
  doc.setFontSize(12);
  doc.text(`Name: ${formData.name}`, 10, 30);
  doc.text(`Email: ${formData.email}`, 10, 40);

  // Open the PDF in a new tab and print
  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  const pdfWindow = window.open(pdfUrl, "_blank");
  if (pdfWindow) {
    pdfWindow.addEventListener("load", () => {
      pdfWindow.print();
    });
  } else {
    alert("Please allow popups to print the PDF.");
  }
};

const PdfForm: React.FC = () => {
  const [formData, setFormData] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateAndPrintPDF(formData); // Call the function here
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 shadow-md rounded-md w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4">Form to PDF</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email:
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Generate & Print PDF
        </button>
      </form>
    </div>
  );
};

export default PdfForm;
