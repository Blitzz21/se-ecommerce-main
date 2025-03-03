const ReturnPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Return Policy</h1>

      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">30-Day Return Policy</h2>
          <p className="text-gray-600 mb-4">
            We offer a 30-day return policy for most items. To be eligible for a return, your item must be unused and in the same condition that you received it. It must also be in the original packaging.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Process</h2>
          <ol className="list-decimal pl-6 text-gray-600">
            <li className="mb-4">
              <strong>Initiate Return:</strong> Log into your account and go to your order history to initiate a return request.
            </li>
            <li className="mb-4">
              <strong>Return Authorization:</strong> Wait for our team to review and approve your return request. You'll receive a Return Merchandise Authorization (RMA) number.
            </li>
            <li className="mb-4">
              <strong>Package Item:</strong> Carefully package the item in its original packaging with all accessories and documentation.
            </li>
            <li className="mb-4">
              <strong>Ship Return:</strong> Ship the item back using the provided return shipping label or your preferred carrier.
            </li>
            <li className="mb-4">
              <strong>Refund Processing:</strong> Once we receive and inspect the item, we'll process your refund within 3-5 business days.
            </li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Non-Returnable Items</h2>
          <p className="text-gray-600 mb-4">
            The following items cannot be returned:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li className="mb-2">Products that have been used or installed</li>
            <li className="mb-2">Products with broken seals or missing parts</li>
            <li className="mb-2">Products showing signs of physical damage</li>
            <li className="mb-2">Software products with activated licenses</li>
            <li className="mb-2">Custom or modified products</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Refund Options</h2>
          <div className="bg-gray-50 p-6 rounded-lg">
            <ul className="list-disc pl-6 text-gray-600">
              <li className="mb-2">Original payment method refund (3-5 business days)</li>
              <li className="mb-2">Store credit (instant)</li>
              <li className="mb-2">Exchange for another product</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Return Shipping</h2>
          <p className="text-gray-600 mb-4">
            For defective products or errors on our part, we'll provide a prepaid return shipping label. For all other returns, customers are responsible for return shipping costs.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Need Help?</h2>
          <p className="text-gray-600 mb-4">
            If you have any questions about our return policy or need assistance with a return, please contact our customer support team:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li className="mb-2">Email: returns@gpuhaven.com</li>
            <li className="mb-2">Phone: (555) 123-4567</li>
            <li className="mb-2">Live Chat: Available on our website during business hours</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

export default ReturnPolicy 