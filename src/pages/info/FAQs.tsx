import { useState } from 'react'

interface FAQ {
  question: string
  answer: string
  category: string
}

const faqs: FAQ[] = [
  {
    category: 'Ordering',
    question: 'How do I place an order?',
    answer: 'You can place an order by browsing our products, adding items to your cart, and proceeding to checkout. You\'ll need to create an account or sign in to complete your purchase.'
  },
  {
    category: 'Ordering',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and cryptocurrency payments (Bitcoin, Ethereum).'
  },
  {
    category: 'Shipping',
    question: 'How long does shipping take?',
    answer: 'Standard shipping typically takes 3-5 business days within the continental US. International shipping can take 7-14 business days depending on the destination.'
  },
  {
    category: 'Shipping',
    question: 'Do you ship internationally?',
    answer: 'Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.'
  },
  {
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We offer a 30-day return policy for unopened items in their original packaging. Please see our Returns Policy page for detailed information.'
  },
  {
    category: 'Technical',
    question: 'Do you offer technical support?',
    answer: 'Yes, our technical support team is available Monday through Friday, 9 AM to 6 PM EST. You can reach us through email or phone.'
  },
  {
    category: 'Technical',
    question: 'How do I check if a GPU is compatible with my system?',
    answer: 'Check your system\'s power supply wattage, available PCIe slots, and case dimensions. You can also contact our support team for assistance.'
  },
  {
    category: 'Warranty',
    question: 'What warranty do your products come with?',
    answer: 'All our products come with the manufacturer\'s warranty. Most GPUs have a 2-3 year warranty period.'
  }
]

const FAQs = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const categories = ['all', ...new Set(faqs.map(faq => faq.category))]

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h1>

      {/* Category Filter */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="space-y-6">
        {filteredFAQs.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-600">
              {faq.answer}
            </p>
            <div className="mt-2">
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                {faq.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FAQs 