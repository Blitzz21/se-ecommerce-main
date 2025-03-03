const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>

      <div className="prose prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-600 mb-4">
            By accessing and using GPU Haven's website and services, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Accounts</h2>
          <div className="text-gray-600">
            <p className="mb-4">When creating an account on our platform, you agree to:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">Provide accurate and complete information</li>
              <li className="mb-2">Maintain the security of your account credentials</li>
              <li className="mb-2">Promptly update any changes to your account information</li>
              <li className="mb-2">Accept responsibility for all activities under your account</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Product Information</h2>
          <p className="text-gray-600 mb-4">
            We strive to provide accurate product descriptions, pricing, and availability information. However, we reserve the right to correct any errors and modify prices without prior notice.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Ordering and Payment</h2>
          <div className="text-gray-600">
            <p className="mb-4">By placing an order, you agree that:</p>
            <ul className="list-disc pl-6 mb-4">
              <li className="mb-2">You are authorized to use the payment method provided</li>
              <li className="mb-2">The information provided is accurate and complete</li>
              <li className="mb-2">We reserve the right to refuse or cancel any order</li>
            </ul>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Shipping and Delivery</h2>
          <p className="text-gray-600 mb-4">
            Delivery times are estimates only. We are not responsible for delays beyond our control. Risk of loss and title pass to you upon delivery to the carrier.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Returns and Refunds</h2>
          <p className="text-gray-600 mb-4">
            Please refer to our Return Policy for detailed information about returns, refunds, and exchanges.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Intellectual Property</h2>
          <p className="text-gray-600 mb-4">
            All content on this website, including text, graphics, logos, and images, is our property and protected by copyright laws.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
          <p className="text-gray-600 mb-4">
            We are not liable for any indirect, incidental, special, or consequential damages arising from the use of our services or products.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Privacy Policy</h2>
          <p className="text-gray-600 mb-4">
            Your use of our services is also governed by our Privacy Policy. Please review it to understand our practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to Terms</h2>
          <p className="text-gray-600 mb-4">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to the website.
          </p>
          <p className="text-gray-600 mb-4">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </section>
      </div>
    </div>
  )
}

export default TermsOfService 