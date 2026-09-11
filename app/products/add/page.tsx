import AddProductForm from "../../../components/AddProductForm";

export default function AddProductPage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Add Product
        </h1>

        <AddProductForm />
      </div>
    </main>
  );
}