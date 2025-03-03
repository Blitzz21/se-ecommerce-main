const ShippingPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>

      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Processing Time</h2>
          <p className="text-gray-600 mb-4">
            All orders are processed within 1-2 business days. Orders placed on weekends or holidays will be processed the next business day.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Methods & Delivery Times</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Domestic Shipping (United States)</h3>
            <ul className="list-disc pl-6 text-gray-600">
              <li className="mb-2">Standard Shipping (3-5 business days) - $9.99</li>
              <li className="mb-2">Express Shipping (2-3 business days) - $19.99</li>
              <li className="mb-2">Next Day Delivery (1 business day) - $29.99</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">International Shipping</h3>
            <ul className="list-disc pl-6 text-gray-600">
              <li className="mb-2">Standard International (7-14 business days) - $29.99</li>
              <li className="mb-2">Express International (3-5 business days) - $49.99</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Free Shipping</h2>
          <p className="text-gray-600 mb-4">
            Free standard shipping is available on orders over $500 within the continental United States.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tracking Your Order</h2>
          <p className="text-gray-600 mb-4">
            Once your order ships, you will receive a shipping confirmation email with a tracking number. You can track your order status by:
          </p>
          <ul className="list-disc pl-6 text-gray-600">
            <li className="mb-2">Clicking the tracking link in your shipping confirmation email</li>
            <li className="mb-2">Logging into your account and viewing your order history</li>
            <li className="mb-2">Contacting our customer support team</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Shipping Restrictions</h2>
          <p className="text-gray-600 mb-4">
            We currently do not ship to PO boxes or APO/FPO addresses. Some restrictions may apply for international shipping based on local regulations.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Damaged or Lost Packages</h2>
          <p className="text-gray-600 mb-4">
            All packages are insured. If your package arrives damaged or is lost during transit, please contact our customer support team within 48 hours of the delivery date.
          </p>
        </section>
      </div>
    </div>
  )
}

export default ShippingPolicy 