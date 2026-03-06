<?php

namespace App\Support;

class DischargeOptions
{
    /**
     * @return array<string, string[]>
     */
    public static function map(): array
    {
        return [
            'OTHER' => [
                'Place not meant for habitation(e.g., a vehicle, an abandoned building, buss/train/subway station/airport or anywheere outside)',
                'Safe Haven',
                'Foster care home or foster care group home',
                'Hospital or other residential non-psychiatric medical facility',
                'Jail, prison, or juvenile detention facility',
                'Long term care facility or nursing home',
                'Psychiatric hospital or other psyschiatric facility',
                'Substance abuse treatment facility or detox center',
                'Transitional housing for homeless persons (including homeless youth)',
                'Residential project or halfway house with no homeless criteria',
                'Hotel or motel paid for without emergency shelter voucher',
                'Host Home (non crisis)',
                'Staying or living with family, temporary tenure (e.g., room, apartment, or house)',
                'Staying or living with friends, temporary tenure (e.g., room, apartment, or house)',
                'Moved from one HOPWA funded project to HOPWA TH',
                'Staying or living with family, permanent tenure',
                'Staying or living with friends, permanent tenure',
                'Moved from one HOPWA funded project to HOPWA PH',
                'Rental by client, no ongoing housing subsidy',
                'Rental by client, with ongoing housing subsidy',
                'Owned by client, with ongoing housing subsidy',
                'Owned by client, no ongoing housing subsidy',
                'Deceased',
            ],
            'AWOL' => [
                'Other',
            ],
            'Self Discharge' => [
                'Other',
            ],
            'Administrative Discharge' => [
                'Other',
                'Place not meant for habitation(e.g., a vehicle, an abandoned building, buss/train/subway station/airport or anywheere outside)',
                'Safe Haven',
                'Foster care home or foster care group home',
                'Hospital or other residential non-psychiatric medical facility',
                'Jail, prison, or juvenile detention facility',
                'Long term care facility or nursing home',
                'Psychiatric hospital or other psyschiatric facility',
                'Substance abuse treatment facility or detox center',
                'Transitional housing for homeless persons (including homeless youth)',
                'Residential project or halfway house with no homeless criteria',
                'Hotel or motel paid for without emergency shelter voucher',
                'Host Home (non crisis)',
                'Staying or living with family, temporary tenure (e.g., room, apartment, or house)',
                'Staying or living with friends, temporary tenure (e.g., room, apartment, or house)',
                'Moved from one HOPWA funded project to HOPWA TH',
                'Staying or living with family, permanent tenure',
                'Staying or living with friends, permanent tenure',
                'Moved from one HOPWA funded project to HOPWA PH',
                'Rental by client, with ongoing housing subsidy',
                'Owned by client, with ongoing housing subsidy',
                'Owned by client, no ongoing housing subsidy',
            ],
            'Alternative Non - Congregate Shelter' => [
                'Emergency shelter, including hotel or motel paid for with emergency shelter voucher, Host Home shelter',
            ],
            'Sober Living' => [
                'Rental by client, no ongoing housing subsidy',
            ],
            "WE CAN'T SELECT" => [
                'No exit interview completed',
                "Client doesn't know",
                'Client prefers not to answer',
                'Data not collected',
            ],
        ];
    }

    /**
     * @return string[]
     */
    public static function dispositions(): array
    {
        return array_keys(self::map());
    }

    /**
     * @return string[]
     */
    public static function destinationsFor(string $disposition): array
    {
        return self::map()[$disposition] ?? [];
    }

    public static function isValid(string $disposition, string $destination): bool
    {
        return in_array($destination, self::destinationsFor($disposition), true);
    }
}

