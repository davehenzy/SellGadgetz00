import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the verification process work?",
      answer: "Our verification process uses a trusted third-party API to verify user identities. You'll need to provide a valid ID and complete a brief verification process. This helps create a secure environment for all users and reduces fraud."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept various payment methods including bank transfers, credit/debit cards, and mobile payment solutions like Paystack and Flutterwave. All transactions are secure and encrypted to protect your financial information."
    },
    {
      question: "How long do laptop repairs typically take?",
      answer: "Basic repairs usually take 1-3 business days, while standard repairs take 3-5 business days. Advanced repairs may take 5-10 business days depending on the complexity and parts availability. You'll receive regular updates on your repair status."
    },
    {
      question: "Is there a warranty for laptop repairs?",
      answer: "Yes, all our repairs come with a 90-day warranty. If the same issue reoccurs within this period, we'll fix it at no additional cost. Some components may have longer manufacturer warranties which we'll specify in your repair documentation."
    },
    {
      question: "How do I know a used laptop is in good condition?",
      answer: "All laptops listed on our platform are thoroughly inspected and verified. Sellers must provide detailed specifications and condition reports, including clear photos. We also offer buyer protection policies and encourage buyers to test laptops upon receipt. If any issues are found that weren't disclosed, you can request a return."
    }
  ];

  return (
    <section id="faq" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our marketplace and repair services.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-gray-200">
                <AccordionTrigger className="text-xl font-semibold text-gray-900">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Still have questions? Contact our support team.</p>
          <a href="#contact">
            <Button className="bg-blue-700 hover:bg-blue-800">
              Contact Support
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
