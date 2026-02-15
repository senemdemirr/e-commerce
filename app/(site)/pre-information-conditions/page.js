export const runtime = "nodejs";

export default function PreInformationConditions() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Preliminary Information Form</h1>

            <div className="space-y-4 text-gray-700">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. SELLER INFORMATION</h2>
                    <p>
                        <strong>Title:</strong> Iron E-Commerce<br />
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. SUBJECT</h2>
                    <p>
                        The subject of this Preliminary Information Form is to inform the BUYER about the basic characteristics, sales price including taxes, payment method, delivery conditions, and the right of withdrawal regarding the product/service subject to sale, in accordance with the Law on Consumer Protection No. 6502 and the Regulation on Distance Contracts.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. CONTRACT SUBJECT PRODUCT/SERVICE INFORMATION</h2>
                    <p>
                        The basic characteristics (type, quantity, brand/model, color, number) of the Product/Service are available on the website of the SELLER. The billing and delivery addresses are as declared by the BUYER during the order process.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. GENERAL CONDITIONS</h2>
                    <p>
                        4.1. The BUYER declares that they have read and informed themselves about the basic characteristics, sales price, payment method, and delivery information of the product subject to the contract on the website and have given the necessary confirmation electronically.
                    </p>
                    <p>
                        4.2. The product subject to the contract shall be delivered to the BUYER or the person/organization at the address indicated by them within the period described in the preliminary information on the website, depending on the distance of the BUYER's residence for each product, provided that it does not exceed the legal 30-day period.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. RIGHT OF WITHDRAWAL</h2>
                    <p>
                        The BUYER has the right to withdraw from the contract within 14 (fourteen) days without giving any reason and without paying any penal clause regarding the sale of goods/services. To exercise the right of withdrawal, the BUYER must notify the SELLER via the contact details provided above relative to the timeline and method specified in the Distance Sales Agreement.
                    </p>
                </section>
            </div>
        </div>
    );
}
