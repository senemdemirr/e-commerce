export const runtime = "edge";

export default function DistanceSalesAgreement() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Distance Sales Agreement</h1>

            <div className="space-y-4 text-gray-700">
                <section>
                    <h2 className="text-xl font-semibold mb-2">1. PARTIES</h2>
                    <p>
                        <strong>1.1. SELLER:</strong><br />
                        Title: E-Commerce Inc.<br />
                        Address: [Company Address]<br />
                        Phone: [Phone Number]<br />
                        Email: [Email Address]
                    </p>
                    <p>
                        <strong>1.2. BUYER:</strong><br />
                        Name/Surname: [Buyer Name]<br />
                        Phone: [Buyer Phone]<br />
                        Email: [Buyer Address]
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. SUBJECT</h2>
                    <p>
                        The subject of this Agreement is the determination of the rights and obligations of the parties in accordance with the Law on Consumer Protection No. 6502 and the Regulation on Distance Contracts regarding the sale and delivery of the product/service specified below, which the BUYER has ordered electronically from the SELLER's website.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. PRODUCT INFORMATION</h2>
                    <p>
                        The type, quantity, brand/model, color, and sales price including taxes of the product(s) overlap with the information on the order summary page and the invoice, which allows strictly being considered an integral part of this contract.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. GENERAL PROVISIONS</h2>
                    <p>
                        4.1. The BUYER declares explicitly on the website that they have read and informed themselves about the basic characteristics, sales price including all taxes, payment method, and delivery details of the product subject to the contract and have given the necessary confirmation electronically.
                    </p>
                    <p>
                        4.2. The SELLER is responsible for delivering the product subject to the contract intact, complete, in accordance with the qualifications specified in the order, and with warranty documents and user manuals, if any.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">5. RIGHT OF WITHDRAWAL</h2>
                    <p>
                        5.1. The BUYER may exercise the right of withdrawal from the contract relative to the refusal of the goods without taking any legal or criminal responsibility and without giving any reason within 14 (fourteen) days from the date of delivery of the product to them or the person/organization at the address indicated.
                    </p>
                    <p>
                        5.2. In order to exercise the right of withdrawal, written notification must be given to the SELLER by registered mail, fax, or email within 14 (fourteen) days, and the product must not be used in accordance with the provisions of "Products for which the Right of Withdrawal cannot be exercised" in this contract.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">6. DISPUTE RESOLUTION</h2>
                    <p>
                        In the implementation of this contract, Consumer Arbitration Committees and Consumer Courts in the place of residence of the BUYER or the SELLER are authorized up to the value declared by the Ministry of Customs and Trade.
                    </p>
                </section>
            </div>
        </div>
    );
}
