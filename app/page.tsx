

export default function Home() {
  return (
    <div className="h-full w-full">
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Aliquid, ipsam corrupti quae illo quisquam, assumenda maxime, iure culpa cupiditate est mollitia fugit alias totam rerum vero non iusto iste natus atque ducimus recusandae? Odit, recusandae. A ipsam ratione officiis ad provident earum, rem at iure illum eligendi alias nam cumque illo perferendis id, debitis sunt error ducimus deserunt vitae possimus asperiores neque distinctio! Sit cumque dignissimos dicta blanditiis quod enim dolorem est debitis asperiores repellendus officia, quidem voluptate, dolore quia alias! Qui nostrum aut iusto, dolore deleniti placeat, culpa architecto ad iste veritatis ab praesentium itaque, voluptates enim repellat. Voluptatibus.

        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Welcome to the Assignment Checker</h1>
            <p className="text-lg text-gray-600 mb-6">Upload and analyze student assignments easily.</p>
            
            {/* Button to navigate to Dashboard */}
            <a href="/dashboard" className="bg-blue-500 text-white px-6 py-3 rounded">
                Go to Dashboard
            </a>
        </div>
    </div>
  );
}
