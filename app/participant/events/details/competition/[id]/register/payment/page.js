"use client";

import { useState } from "react";
import Link from "next/link";

export default function PaymentPage() {
  const [method, setMethod] = useState("UPI");

  return (
    <main className="min-h-screen bg-[#071225] text-white">

      {/* Header */}
      <header className="border-b border-white/10 bg-[#08152b]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">

          <Link
            href="/participant/events/details/register"
            className="text-sm text-gray-400 transition hover:text-white"
          >
            ← Back to Registration
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 font-bold">
              E
            </div>

            <span className="font-bold">
              EventHub AI
            </span>
          </div>

        </div>
      </header>


      {/* Main */}
      <section className="mx-auto max-w-6xl px-6 py-10">

        {/* Heading */}
        <div className="mb-8">

          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
            Secure Checkout
          </p>

          <h1 className="text-4xl font-bold">
            Complete Your Payment
          </h1>

          <p className="mt-3 text-gray-400">
            Confirm your registration and choose a payment method.
          </p>

        </div>


        <div className="grid gap-8 lg:grid-cols-[1fr_350px]">

          {/* Payment Section */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">

            <h2 className="text-xl font-bold">
              Select Payment Method
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Choose your preferred payment option.
            </p>


            {/* Payment Methods */}
            <div className="mt-6 grid gap-3 sm:grid-cols-3">

              <PaymentMethod
                icon="📱"
                title="UPI"
                selected={method === "UPI"}
                onClick={() => setMethod("UPI")}
              />

              <PaymentMethod
                icon="💳"
                title="Card"
                selected={method === "Card"}
                onClick={() => setMethod("Card")}
              />

              <PaymentMethod
                icon="🏦"
                title="Net Banking"
                selected={method === "Net Banking"}
                onClick={() => setMethod("Net Banking")}
              />

            </div>


            {/* Dynamic Payment Form */}
            <div className="mt-7 rounded-2xl border border-white/10 bg-[#0b1a32] p-6">

              {method === "UPI" && (
                <UPIForm />
              )}

              {method === "Card" && (
                <CardForm />
              )}

              {method === "Net Banking" && (
                <BankingForm />
              )}

            </div>


            {/* Security */}
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-500/10 bg-green-500/5 p-4">

              <span className="text-green-400">
                🔒
              </span>

              <div>

                <p className="text-sm font-medium text-green-400">
                  Secure Payment
                </p>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  Your payment information is protected using secure
                  payment processing.
                </p>

              </div>

            </div>

          </div>


          {/* Order Summary */}
          <aside>

            <div className="sticky top-8 rounded-2xl border border-white/10 bg-[#0b1a32] p-6">

              <p className="text-sm text-gray-500">
                Order Summary
              </p>

              <h2 className="mt-3 text-xl font-bold">
                Tech Hackathon 2026
              </h2>

              <div className="mt-6 space-y-4">

                <SummaryRow
                  label="Registration"
                  value="₹100"
                />

                <SummaryRow
                  label="Platform Fee"
                  value="₹0"
                />

                <SummaryRow
                  label="Tax"
                  value="₹0"
                />

              </div>

              <div className="my-6 h-px bg-white/10" />

              <div className="flex items-center justify-between">

                <span className="text-gray-400">
                  Total
                </span>

                <span className="text-2xl font-bold">
                  ₹100
                </span>

              </div>


              {/* Pay Button */}
              <Link
  href="/participant/events/details/register/payment/success"
  className="mt-7 block w-full rounded-xl bg-blue-600 px-5 py-4 text-center font-bold transition hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/20"
>
  Pay ₹100 →
</Link>


              <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                By continuing, you agree to the event registration
                terms and payment conditions.
              </p>

            </div>

          </aside>

        </div>

      </section>

    </main>
  );
}


/* ================= PAYMENT METHOD ================= */

function PaymentMethod({
  icon,
  title,
  selected,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-500/10"
          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
      }`}
    >

      <div className="flex items-center gap-3">

        <span className="text-xl">
          {icon}
        </span>

        <div>

          <p className="font-semibold">
            {title}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {selected ? "Selected" : "Choose"}
          </p>

        </div>

      </div>

    </button>
  );
}


/* ================= UPI ================= */

function UPIForm() {
  return (
    <div>

      <h3 className="font-semibold">
        Pay using UPI
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Enter your UPI ID to continue.
      </p>

      <div className="mt-5">

        <label className="mb-2 block text-sm font-medium">
          UPI ID
        </label>

        <input
          type="text"
          placeholder="example@upi"
          className="w-full rounded-xl border border-white/10 bg-[#071225] px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
        />

      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-500">
        <span className="rounded-lg border border-white/10 px-3 py-2">
          Google Pay
        </span>

        <span className="rounded-lg border border-white/10 px-3 py-2">
          PhonePe
        </span>

        <span className="rounded-lg border border-white/10 px-3 py-2">
          Paytm
        </span>
      </div>

    </div>
  );
}


/* ================= CARD ================= */

function CardForm() {
  return (
    <div>

      <h3 className="font-semibold">
        Pay using Card
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Enter your card details.
      </p>

      <div className="mt-5 space-y-5">

        <Input
          label="Card Number"
          placeholder="1234 5678 9012 3456"
        />

        <Input
          label="Cardholder Name"
          placeholder="Enter name on card"
        />

        <div className="grid gap-5 sm:grid-cols-2">

          <Input
            label="Expiry Date"
            placeholder="MM / YY"
          />

          <Input
            label="CVV"
            placeholder="•••"
            type="password"
          />

        </div>

      </div>

    </div>
  );
}


/* ================= BANKING ================= */

function BankingForm() {
  return (
    <div>

      <h3 className="font-semibold">
        Net Banking
      </h3>

      <p className="mt-1 text-sm text-gray-500">
        Select your bank to continue.
      </p>

      <div className="mt-5">

        <label className="mb-2 block text-sm font-medium">
          Select Bank
        </label>

        <select className="w-full rounded-xl border border-white/10 bg-[#071225] px-4 py-3.5 text-sm text-gray-300 outline-none focus:border-blue-500">

          <option>Select your bank</option>
          <option>State Bank of India</option>
          <option>HDFC Bank</option>
          <option>ICICI Bank</option>
          <option>Axis Bank</option>
          <option>Kotak Mahindra Bank</option>

        </select>

      </div>

    </div>
  );
}


/* ================= INPUT ================= */

function Input({
  label,
  placeholder,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-[#071225] px-4 py-3.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-blue-500"
      />

    </div>
  );
}


/* ================= SUMMARY ROW ================= */

function SummaryRow({
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between text-sm">

      <span className="text-gray-500">
        {label}
      </span>

      <span className="text-gray-300">
        {value}
      </span>

    </div>
  );
}