"use client"

import { useGlobalStore } from "@/store/globalStore";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import Image from "next/image";

export type TravelLocation = {
    id: number;
    vehicle: Vehicle;
    country: string;
    description: string;
    departure: Date;
    capacity: number;
    pictureUrl: string;
}

export type Vehicle = {
    id: number;
    type: string;
}



export default function PaginationExamplePage() {
    const [locations, setLocations] = useState<TravelLocation[]>([])
    const { gs, set } = useGlobalStore();
    const limit: number = 2

    useEffect(() => {
        async function getLocations() {
            const res = await axios.get(
                `http://localhost:3000/api/journeys/${gs.actualPage}/${limit}/${gs.searchTerm || "*"}`,
            );
            console.log(res)
            setLocations(res.data);
            set("numberOfRecords", locations.length);
            set("numberOfPages", Math.ceil(gs.numberOfRecords / limit) || 1);
        }
        getLocations();
    }, [set, gs.numberOfRecords, gs.searchTerm, gs.actualPage, gs.numberOfPages]);
    return (

        <div className="justify-top flex flex-col items-center px-10">
            {/* Input serch term */}
            <div className="m-3 w-100">
                <label className="input text-xl">
                    <Search className="input-icon" />
                    <input
                        placeholder="Keresés..."
                        required
                        type="search"
                        value={gs.searchTerm}
                        onChange={(e) => set("searchTerm", e.target.value)}
                    />
                </label>
            </div>
            {/* First, previous, next, last buttons */}

            {JSON.stringify(locations)}
            <div className="overflow-hidden rounded-xl bg-blue-200 shadow-md w-full m-5" >
                <div className="table-responsive p-4">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="text-sm">
                                    <th>Ország</th>
                                    <th>Jármű</th>
                                    <th>Indulás</th>
                                    <th>Férőhely</th>
                                    <th>Leírás</th>
                                    <th>Kép</th>
                                </tr>
                            </thead>

                            <tbody>
                                {locations.map((l) => (
                                    <tr className="hover" key={l.id}>
                                        <td className="font-semibold text-2xl  whitespace-nowrap">
                                            {l.country}
                                        </td>

                                        <td>
                                            <span className="text-xl">
                                                {l.vehicle.type}
                                            </span>
                                        </td>

                                        <td className="text-xl whitespace-nowrap">
                                            {new Date(l.departure).toLocaleDateString()}
                                        </td>

                                        <td className="text-xl">
                                            {l.capacity} fő
                                        </td>

                                        <td className="max-w-xs text-sm text-base-content/70">
                                            {l.description.substring(0, 500)}...
                                        </td>

                                        <td>
                                            <Image
                                                alt={l.country}
                                                className="rounded-lg object-cover"
                                                height={200}
                                                src={l.pictureUrl}
                                                width={300}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
            {/* {JSON.stringify(viewpoints)} */}
            <div className="flex space-x-2 btn-group">
                <button
                    className="btn btn-primary d-flex align-items-center"
                    disabled={gs.actualPage === 1}
                    title="First"
                    onClick={() => set("actualPage", 1)}
                >
                    <ChevronsLeft size={50} />
                </button>

                <button
                    className="btn btn-primary d-flex align-items-center"
                    disabled={gs.actualPage === 1}
                    title="Previous"
                    onClick={() => set("actualPage", gs.actualPage - 1)}
                >
                    <ChevronLeft size={50} />
                </button>

                <button
                    className="btn btn-primary d-flex align-items-center"
                    disabled={gs.numberOfPages === gs.actualPage}
                    title="Next"
                    onClick={() => set("actualPage", gs.actualPage + 1)}
                >
                    <ChevronRight size={50} />
                </button>

                <button
                    className="btn btn-primary d-flex align-items-center"
                    disabled={gs.numberOfPages === gs.actualPage}
                    title="Last"
                    onClick={() => set("actualPage", gs.numberOfPages)}
                >
                    <ChevronsRight size={50} />
                </button>
            </div>
        </div>

    )
}