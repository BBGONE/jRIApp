param($installPath, $toolsPath, $package, $project)
    # MSBuild Targets file to add
    $targetsFile = [System.IO.Path]::Combine($toolsPath, 'Microsoft.TypeScript.targets')
    $propsFile = [System.IO.Path]::Combine($toolsPath, 'Microsoft.TypeScript.Default.props')
    $nugetPropsFile = [System.IO.Path]::Combine($toolsPath, 'Microsoft.TypeScript.NuGet.props')

    # Load MSBuild assembly
    Add-Type -AssemblyName 'Microsoft.Build, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a'
    $msbuild = [Microsoft.Build.Evaluation.ProjectCollection]::GlobalProjectCollection.GetLoadedProjects($project.FullName) | Select-Object -First 1

    # Make relative paths
    $projectUri = new-object Uri('file://' + $project.FullName)
    $targetsUri = new-object Uri('file://' + $targetsFile)
    $propsUri = new-object Uri('file://' + $propsFile)
    $nugetPropsUri = new-object Uri('file://' + $nugetPropsFile)

    # Make relative URI and fix up slashes
    $targetsRelative = $projectUri.MakeRelativeUri($targetsUri).ToString().Replace([System.IO.Path]::AltDirectorySeparatorChar, [System.IO.Path]::DirectorySeparatorChar)
    $propsRelative = $projectUri.MakeRelativeUri($propsUri).ToString().Replace([System.IO.Path]::AltDirectorySeparatorChar, [System.IO.Path]::DirectorySeparatorChar)
    $nugetPropsRelative = $projectUri.MakeRelativeUri($nugetPropsUri).ToString().Replace([System.IO.Path]::AltDirectorySeparatorChar, [System.IO.Path]::DirectorySeparatorChar)

    # Remove old targets and props
    $targetToRemove = $msbuild.Xml.Imports | Where-Object { $_.Project.Endswith('Microsoft.TypeScript.targets') }
    if ($targetToRemove){
      $msbuild.Xml.RemoveChild($targetToRemove) | out-null
    }

    $propsToRemove = $msbuild.Xml.Imports | Where-Object { $_.Project.Endswith('Microsoft.TypeScript.Default.props') }
    if ($propsToRemove){
      $msbuild.Xml.RemoveChild($propsToRemove) | out-null
    }
    
    $nugetPropsToRemove = $msbuild.Xml.Imports | Where-Object { $_.Project.Endswith('Microsoft.TypeScript.NuGet.props') }
    if ($nugetPropsToRemove){
      $msbuild.Xml.RemoveChild($nugetPropsToRemove) | out-null
    }

    # Add the targets import at the bottom
    $targetsElement = $msbuild.Xml.CreateImportElement($targetsRelative)
    $targetsElement.Condition = "Exists('" + $targetsRelative + "')"
    $msbuild.Xml.AppendChild($targetsElement) | out-null

    # Add the props imports at the top
    $nugetPropsElement = $msbuild.Xml.CreateImportElement($nugetPropsRelative)
    $nugetPropsElement.Condition = "Exists('" + $nugetPropsRelative + "')"
    $msbuild.Xml.PrependChild($nugetPropsElement) | out-null

    $propsElement = $msbuild.Xml.CreateImportElement($propsRelative)
    $propsElement.Condition = "Exists('" + $propsRelative + "')"
    $msbuild.Xml.PrependChild($propsElement) | out-null

    # save project
    $project.Save()
