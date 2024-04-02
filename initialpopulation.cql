context Patient

define "InInitialPopulation":
    AgeInYearsAt(@2013-01-01) >= 16 and AgeInYearsAt(@2013-01-01) < 24

context Unfiltered

define "InitialPopulationCount":
    Count(InInitialPopulation IP where IP is true)

InitialPopulationCount